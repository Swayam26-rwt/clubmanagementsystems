import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth, formatApiErrorDetail } from '@/lib/auth';
import {
  LayoutGrid, CheckSquare, Users, Calendar, Megaphone, Radio, UserCheck, LogOut,
  Plus, Trash2, Check, X, Flag, Clock, MoreVertical, ArrowUpRight, Search
} from 'lucide-react';

const STATUS_COLUMNS = [
  { id: 'todo', label: 'TO DO', hint: 'Not started' },
  { id: 'in_progress', label: 'IN PROGRESS', hint: 'Actively working' },
  { id: 'review', label: 'REVIEW', hint: 'Waiting for review' },
  { id: 'done', label: 'DONE', hint: 'Completed' },
];

const PRIORITY_META = {
  urgent: { label: 'URGENT', bg: 'bg-white', fg: 'text-black', border: 'border-white' },
  high: { label: 'HIGH', bg: 'bg-transparent', fg: 'text-white', border: 'border-white' },
  medium: { label: 'MED', bg: 'bg-transparent', fg: 'text-white/80', border: 'border-white/40' },
  low: { label: 'LOW', bg: 'bg-transparent', fg: 'text-white/50', border: 'border-white/20' },
};

const NAV = [
  { id: 'home', label: 'HOME', icon: LayoutGrid },
  { id: 'tasks', label: 'TASKS', icon: CheckSquare },
  { id: 'team', label: 'TEAM', icon: Users },
  { id: 'events', label: 'EVENTS', icon: Calendar },
  { id: 'members', label: 'MEMBERS', icon: UserCheck },
  { id: 'announcements', label: 'ANNOUNCEMENTS', icon: Megaphone },
  { id: 'marquee', label: 'MARQUEE', icon: Radio },
];

export default function CoreTeamDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('home');
  const [data, setData] = useState({
    tasks: [], team: [], events: [], members: [], pending: [], announcements: [], notifications: [],
  });
  const [modal, setModal] = useState(null); // { type, payload }

  const load = async () => {
    try {
      const [t, team, e, m, p, a, n] = await Promise.all([
        api.get('/tasks'),
        api.get('/team'),
        api.get('/events'),
        api.get('/members'),
        api.get('/members/pending'),
        api.get('/announcements'),
        api.get('/notifications'),
      ]);
      setData({
        tasks: t.data, team: team.data, events: e.data, members: m.data,
        pending: p.data, announcements: a.data, notifications: n.data,
      });
    } catch (err) {
      toast.error('Failed to load');
    }
  };
  useEffect(() => { load(); }, []);

  const onLogout = async () => { await logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-white/10 flex-col sticky top-0 h-screen">
        <Link to="/" data-testid="dash-home-link" className="h-16 border-b border-white/10 px-5 flex items-center gap-3">
          <div className="w-8 h-8 border border-white/60 grid place-items-center font-display font-black text-[10px]">TMC</div>
          <div className="font-display font-black uppercase tracking-[0.2em] text-[11px]">THE MOMENT</div>
        </Link>
        <div className="p-3 border-b border-white/10">
          <div className="font-mono text-[10px] tracking-widest uppercase opacity-50 mb-2 px-2">WORKSPACE</div>
          <div className="border border-white/15 px-3 py-2">
            <div className="font-display font-bold uppercase text-xs tracking-widest">CORE TEAM</div>
            <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-0.5 truncate">{user?.name}</div>
          </div>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                data-testid={`nav-${item.id}`}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 font-display font-bold uppercase text-[11px] tracking-widest transition-colors ${active ? 'bg-white text-black' : 'text-white/75 hover:bg-white/5'}`}
              >
                <Icon size={14} /> {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button data-testid="dash-logout-btn" onClick={onLogout} className="w-full btn-outline-w py-2 font-display font-bold uppercase text-[11px] tracking-widest inline-flex items-center justify-center gap-2">
            <LogOut size={12} /> Logout
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-black border-b border-white/10 flex items-center justify-between px-4">
        <Link to="/" className="font-display font-black uppercase tracking-[0.2em] text-xs">TMC · CORE</Link>
        <button onClick={onLogout} className="btn-outline-w px-3 py-1.5 font-display font-bold uppercase text-[10px] tracking-widest">LOGOUT</button>
      </div>

      {/* MAIN */}
      <main className="flex-1 md:ml-0 pt-14 md:pt-0 min-w-0">
        {view === 'home' && <HomeView data={data} setView={setView} user={user} />}
        {view === 'tasks' && <TasksView data={data} reload={load} onOpenModal={setModal} />}
        {view === 'team' && <TeamView data={data} />}
        {view === 'events' && <EventsView data={data} reload={load} onOpenModal={setModal} />}
        {view === 'members' && <MembersView data={data} reload={load} />}
        {view === 'announcements' && <AnnouncementsView data={data} reload={load} onOpenModal={setModal} />}
        {view === 'marquee' && <MarqueeView data={data} reload={load} onOpenModal={setModal} />}
      </main>

      {modal?.type === 'task' && <TaskModal team={data.team} initial={modal.payload} onClose={() => setModal(null)} onDone={() => { setModal(null); load(); }} />}
      {modal?.type === 'event' && <EventModal initial={modal.payload} onClose={() => setModal(null)} onDone={() => { setModal(null); load(); }} />}
      {modal?.type === 'notif' && <NotifModal onClose={() => setModal(null)} onDone={() => { setModal(null); load(); }} />}
      {modal?.type === 'ann' && <AnnModal onClose={() => setModal(null)} onDone={() => { setModal(null); load(); }} />}
    </div>
  );
}

/* ============================= HEADER ============================= */
function ViewHeader({ title, subtitle, action, testid }) {
  return (
    <div className="border-b border-white/10 px-6 md:px-10 py-8 flex flex-wrap items-end justify-between gap-4" data-testid={testid}>
      <div>
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-60 mb-2">§ WORKSPACE</div>
        <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9]">{title}</h1>
        {subtitle && <p className="text-white/65 mt-2 max-w-2xl text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ============================= HOME ============================= */
function HomeView({ data, setView, user }) {
  const openTasks = data.tasks.filter(t => t.status !== 'done').length;
  const doneTasks = data.tasks.filter(t => t.status === 'done').length;
  const upcoming = data.events.filter(e => e.date >= new Date().toISOString().slice(0, 10));
  return (
    <div>
      <ViewHeader
        testid="home-header"
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Core'}.`}
        subtitle="Your club at a glance — tasks, events, people."
      />
      <div className="p-6 md:p-10 space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="OPEN TASKS" value={openTasks} />
          <Kpi label="COMPLETED" value={doneTasks} />
          <Kpi label="UPCOMING EVENTS" value={upcoming.length} />
          <Kpi label="PENDING MEMBERS" value={data.pending.length} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SectionCard title="RECENT TASKS" onMore={() => setView('tasks')}>
            <ul className="divide-y divide-white/10">
              {data.tasks.slice(0, 5).map(t => (
                <li key={t.task_id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-display font-bold uppercase tracking-tight truncate">{t.title}</div>
                    <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-0.5">{t.status.replace('_', ' ')} · {t.assignee_name || 'UNASSIGNED'}</div>
                  </div>
                  <PriorityChip p={t.priority} />
                </li>
              ))}
              {data.tasks.length === 0 && <li className="py-8 text-center text-white/50 text-sm">No tasks yet.</li>}
            </ul>
          </SectionCard>

          <SectionCard title="UPCOMING EVENTS" onMore={() => setView('events')}>
            <ul className="divide-y divide-white/10">
              {upcoming.slice(0, 5).map(e => (
                <li key={e.event_id} className="py-3">
                  <div className="font-display font-bold uppercase tracking-tight">{e.title}</div>
                  <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-0.5">{e.date} · {e.location}</div>
                </li>
              ))}
              {upcoming.length === 0 && <li className="py-8 text-center text-white/50 text-sm">No upcoming events.</li>}
            </ul>
          </SectionCard>

          <SectionCard title="PENDING APPROVALS" onMore={() => setView('members')}>
            <ul className="divide-y divide-white/10">
              {data.pending.slice(0, 5).map(m => (
                <li key={m.user_id} className="py-3">
                  <div className="font-display font-bold uppercase tracking-tight">{m.name}</div>
                  <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-0.5">{m.email}</div>
                </li>
              ))}
              {data.pending.length === 0 && <li className="py-8 text-center text-white/50 text-sm">All caught up.</li>}
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="border border-white/10 p-5">
      <div className="font-mono text-[10px] tracking-widest uppercase opacity-60">{label}</div>
      <div className="font-display text-4xl font-black mt-1 tabular-nums">{String(value).padStart(2, '0')}</div>
    </div>
  );
}

function SectionCard({ title, onMore, children }) {
  return (
    <section className="border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="font-display font-bold uppercase tracking-widest text-xs">{title}</div>
        {onMore && <button onClick={onMore} className="font-mono text-[10px] tracking-widest uppercase opacity-70 hover:opacity-100 inline-flex items-center gap-1">OPEN <ArrowUpRight size={12}/></button>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function PriorityChip({ p }) {
  const meta = PRIORITY_META[p] || PRIORITY_META.medium;
  return (
    <span className={`font-mono text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 border ${meta.bg} ${meta.fg} ${meta.border}`}>
      {meta.label}
    </span>
  );
}

/* ============================= TASKS (KANBAN) ============================= */
function TasksView({ data, reload, onOpenModal }) {
  const [filter, setFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [dragId, setDragId] = useState(null);

  const filtered = useMemo(() => {
    return data.tasks.filter(t => {
      if (filter && !t.title.toLowerCase().includes(filter.toLowerCase())) return false;
      if (assigneeFilter && t.assignee_id !== assigneeFilter) return false;
      return true;
    });
  }, [data.tasks, filter, assigneeFilter]);

  const grouped = useMemo(() => {
    const g = { todo: [], in_progress: [], review: [], done: [] };
    filtered.forEach(t => { if (g[t.status]) g[t.status].push(t); });
    return g;
  }, [filtered]);

  const onDrop = async (status, task_id) => {
    setDragId(null);
    const task = data.tasks.find(t => t.task_id === task_id);
    if (!task || task.status === status) return;
    try {
      await api.patch(`/tasks/${task_id}`, { status });
      reload();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };

  const delTask = async (id) => {
    try { await api.delete(`/tasks/${id}`); reload(); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };

  return (
    <div>
      <ViewHeader
        testid="tasks-header"
        title="Tasks."
        subtitle="Drag cards across columns to change status. ClickUp-style board."
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
              <input
                data-testid="tasks-search-input"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="SEARCH TASKS"
                className="bg-transparent border border-white/20 focus:border-white outline-none pl-9 pr-4 py-2 text-xs font-mono tracking-widest uppercase placeholder:opacity-50 w-52"
              />
            </div>
            <select
              data-testid="tasks-assignee-filter"
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
              className="bg-black border border-white/20 px-3 py-2 text-xs font-mono tracking-widest uppercase"
            >
              <option value="">ALL ASSIGNEES</option>
              {data.team.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
            </select>
            <button
              data-testid="task-new-btn"
              onClick={() => onOpenModal({ type: 'task', payload: null })}
              className="btn-inv px-4 py-2 font-display font-bold uppercase text-xs tracking-widest inline-flex items-center gap-2"
            >
              <Plus size={14}/> NEW TASK
            </button>
          </div>
        }
      />
      <div className="p-4 md:p-6 overflow-x-auto no-scrollbar">
        <div className="grid grid-cols-4 gap-3 min-w-[980px]">
          {STATUS_COLUMNS.map(col => (
            <div
              key={col.id}
              data-testid={`col-${col.id}`}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => { const id = e.dataTransfer.getData('text/plain'); onDrop(col.id, id); }}
              className={`border border-white/10 bg-white/[0.02] min-h-[60vh] flex flex-col ${dragId ? 'ring-1 ring-white/10' : ''}`}
            >
              <div className="flex items-center justify-between px-3 py-3 border-b border-white/10">
                <div>
                  <div className="font-display font-bold uppercase tracking-widest text-[11px]">{col.label}</div>
                  <div className="font-mono text-[9px] tracking-widest uppercase opacity-60 mt-0.5">{col.hint}</div>
                </div>
                <div className="font-mono text-[10px] tracking-widest uppercase border border-white/20 px-2 py-0.5">{grouped[col.id].length}</div>
              </div>
              <div className="p-2 flex-1 flex flex-col gap-2">
                {grouped[col.id].map(t => (
                  <TaskCard
                    key={t.task_id}
                    t={t}
                    onClick={() => onOpenModal({ type: 'task', payload: t })}
                    onDelete={() => delTask(t.task_id)}
                    onDragStart={() => setDragId(t.task_id)}
                  />
                ))}
                {grouped[col.id].length === 0 && (
                  <div className="text-white/30 text-xs font-mono tracking-widest uppercase p-3 text-center">EMPTY</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskCard({ t, onClick, onDelete, onDragStart }) {
  return (
    <article
      data-testid={`task-${t.task_id}`}
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', t.task_id); onDragStart(); }}
      onClick={onClick}
      className="border border-white/10 bg-black p-3 cursor-grab active:cursor-grabbing hover:border-white/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-display font-bold text-sm uppercase tracking-tight leading-tight flex-1">{t.title}</div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          data-testid={`task-del-${t.task_id}`}
          className="opacity-40 hover:opacity-100"
        >
          <Trash2 size={12}/>
        </button>
      </div>
      {t.description && <div className="text-xs text-white/55 mt-2 line-clamp-2">{t.description}</div>}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <PriorityChip p={t.priority} />
        {t.due_date && (
          <span className="font-mono text-[9px] tracking-widest uppercase opacity-70 inline-flex items-center gap-1">
            <Clock size={10}/> {t.due_date}
          </span>
        )}
      </div>
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
        <Avatar name={t.assignee_name || '—'} />
        <span className="font-mono text-[9px] tracking-widest uppercase opacity-60 truncate">{t.assignee_name || 'UNASSIGNED'}</span>
      </div>
    </article>
  );
}

function Avatar({ name }) {
  const initials = (name || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="w-6 h-6 border border-white/40 grid place-items-center font-display font-black text-[9px] tracking-tight">
      {initials}
    </div>
  );
}

/* ============================= TEAM ============================= */
function TeamView({ data }) {
  return (
    <div>
      <ViewHeader testid="team-header" title="Team." subtitle="Core team + faculty mentors and their workload." />
      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {data.team.map(u => (
            <div key={u.user_id} className="bg-black p-5" data-testid={`team-${u.user_id}`}>
              <div className="flex items-start justify-between">
                <Avatar name={u.name} />
                <span className="font-mono text-[10px] tracking-widest uppercase border border-white/25 px-2 py-0.5">{u.role.replace('_', ' ')}</span>
              </div>
              <div className="mt-4 font-display font-black uppercase tracking-tight">{u.name}</div>
              <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-0.5">{u.email}</div>
              <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 mt-4">
                <div className="bg-black p-3">
                  <div className="font-mono text-[9px] tracking-widest uppercase opacity-60">OPEN</div>
                  <div className="font-display text-2xl font-black tabular-nums">{String(u.open_tasks || 0).padStart(2, '0')}</div>
                </div>
                <div className="bg-black p-3">
                  <div className="font-mono text-[9px] tracking-widest uppercase opacity-60">DONE</div>
                  <div className="font-display text-2xl font-black tabular-nums">{String(u.done_tasks || 0).padStart(2, '0')}</div>
                </div>
              </div>
            </div>
          ))}
          {data.team.length === 0 && <div className="bg-black p-10 text-center text-white/50 font-mono text-xs tracking-widest uppercase col-span-full">NO TEAM MEMBERS YET</div>}
        </div>
      </div>
    </div>
  );
}

/* ============================= EVENTS ============================= */
function EventsView({ data, reload, onOpenModal }) {
  const del = async (id) => {
    try { await api.delete(`/events/${id}`); reload(); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };
  return (
    <div>
      <ViewHeader
        testid="events-header"
        title="Events."
        subtitle="Create events, add winners & photos — past events appear in the public gallery."
        action={
          <button data-testid="event-new-btn" onClick={() => onOpenModal({ type: 'event', payload: null })} className="btn-inv px-4 py-2 font-display font-bold uppercase text-xs tracking-widest inline-flex items-center gap-2">
            <Plus size={14}/> NEW EVENT
          </button>
        }
      />
      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {data.events.map(e => (
            <article key={e.event_id} className="bg-black group" data-testid={`event-${e.event_id}`}>
              {e.image_url && (
                <div className="aspect-[4/3] overflow-hidden border-b border-white/10">
                  <img src={e.image_url} alt={e.title} className="w-full h-full object-cover grayscale" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center justify-between font-mono text-[10px] tracking-widest uppercase opacity-60 mb-2">
                  <span>{e.category}</span>
                  <span>{e.date}</span>
                </div>
                <h3 className="font-display text-xl font-black uppercase tracking-tight leading-tight">{e.title}</h3>
                <p className="text-xs text-white/60 mt-2 line-clamp-2">{e.description}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                  <span className="font-mono text-[10px] tracking-widest uppercase opacity-70">{e.registered_count || 0} REG</span>
                  <div className="flex gap-2">
                    <button onClick={() => onOpenModal({ type: 'event', payload: e })} data-testid={`event-edit-${e.event_id}`} className="font-mono text-[10px] tracking-widest uppercase underline underline-offset-4 opacity-80 hover:opacity-100">EDIT</button>
                    <button onClick={() => del(e.event_id)} data-testid={`event-del-${e.event_id}`} className="opacity-60 hover:opacity-100"><Trash2 size={12}/></button>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {data.events.length === 0 && <div className="bg-black col-span-full p-10 text-center text-white/50 text-sm">No events yet.</div>}
        </div>
      </div>
    </div>
  );
}

/* ============================= MEMBERS ============================= */
function MembersView({ data, reload }) {
  const approve = async (id) => { try { await api.post(`/members/${id}/approve`); reload(); } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); } };
  const reject = async (id) => { try { await api.post(`/members/${id}/reject`); reload(); } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); } };
  return (
    <div>
      <ViewHeader testid="members-header" title="Members." subtitle="Approve pending requests; browse the directory." />
      <div className="p-6 md:p-10 space-y-8">
        <SectionCard title={`PENDING · ${data.pending.length}`}>
          <ul className="divide-y divide-white/10">
            {data.pending.map(m => (
              <li key={m.user_id} className="py-3 flex items-center justify-between gap-3" data-testid={`pending-${m.user_id}`}>
                <div>
                  <div className="font-display font-bold uppercase tracking-tight">{m.name}</div>
                  <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-0.5">{m.email} · {m.department || '—'}</div>
                </div>
                <div className="flex gap-2">
                  <button data-testid={`approve-${m.user_id}`} onClick={() => approve(m.user_id)} className="btn-inv px-3 py-1.5 font-display font-bold uppercase text-[10px] tracking-widest inline-flex items-center gap-1"><Check size={12}/> Approve</button>
                  <button data-testid={`reject-${m.user_id}`} onClick={() => reject(m.user_id)} className="btn-outline-w px-3 py-1.5 font-display font-bold uppercase text-[10px] tracking-widest inline-flex items-center gap-1"><X size={12}/> Reject</button>
                </div>
              </li>
            ))}
            {data.pending.length === 0 && <li className="py-8 text-center text-white/50 text-sm">No pending requests.</li>}
          </ul>
        </SectionCard>

        <SectionCard title={`DIRECTORY · ${data.members.length}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-[10px] tracking-widest uppercase opacity-60">
                  <th className="pb-2">NAME</th><th className="pb-2">EMAIL</th><th className="pb-2">DEPT</th><th className="pb-2">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {data.members.map(m => (
                  <tr key={m.user_id} className="border-t border-white/10">
                    <td className="py-2 font-display font-semibold uppercase">{m.name}</td>
                    <td className="py-2 font-mono text-xs">{m.email}</td>
                    <td className="py-2">{m.department || '—'}</td>
                    <td className="py-2">
                      {m.approved
                        ? <span className="border border-white/30 px-2 py-0.5 text-[10px] uppercase tracking-widest">ACTIVE</span>
                        : <span className="opacity-60 text-[10px] uppercase tracking-widest">PENDING</span>}
                    </td>
                  </tr>
                ))}
                {data.members.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-white/50 text-sm">No members yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

/* ============================= ANNOUNCEMENTS / MARQUEE ============================= */
function AnnouncementsView({ data, reload, onOpenModal }) {
  return (
    <div>
      <ViewHeader
        testid="ann-header" title="Announcements."
        action={<button data-testid="ann-new-btn" onClick={() => onOpenModal({ type: 'ann' })} className="btn-inv px-4 py-2 font-display font-bold uppercase text-xs tracking-widest inline-flex items-center gap-2"><Plus size={14}/> NEW</button>}
      />
      <div className="p-6 md:p-10">
        <ul className="divide-y divide-white/10 border border-white/10">
          {data.announcements.map(a => (
            <li key={a.ann_id} className="p-5">
              <div className="font-display font-bold uppercase tracking-tight">{a.title}</div>
              <div className="text-sm text-white/75 mt-1">{a.body}</div>
              <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-1">— {a.author_name} · {a.author_role}</div>
            </li>
          ))}
          {data.announcements.length === 0 && <li className="p-10 text-center text-white/50 text-sm">No announcements.</li>}
        </ul>
      </div>
    </div>
  );
}

function MarqueeView({ data, reload, onOpenModal }) {
  const del = async (id) => { try { await api.delete(`/notifications/${id}`); reload(); } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); } };
  return (
    <div>
      <ViewHeader
        testid="marquee-header" title="Marquee Bar."
        subtitle="Headline ticker on the public landing page."
        action={<button data-testid="notif-new-btn" onClick={() => onOpenModal({ type: 'notif' })} className="btn-inv px-4 py-2 font-display font-bold uppercase text-xs tracking-widest inline-flex items-center gap-2"><Plus size={14}/> NEW</button>}
      />
      <div className="p-6 md:p-10">
        <ul className="divide-y divide-white/10 border border-white/10">
          {data.notifications.map(n => (
            <li key={n.notif_id} className="p-5 flex items-center justify-between gap-3">
              <div className="font-mono text-xs tracking-wide uppercase">{n.message}</div>
              <button onClick={() => del(n.notif_id)} data-testid={`notif-del-${n.notif_id}`} className="opacity-60 hover:opacity-100"><Trash2 size={14}/></button>
            </li>
          ))}
          {data.notifications.length === 0 && <li className="p-10 text-center text-white/50 text-sm">No active notifications.</li>}
        </ul>
      </div>
    </div>
  );
}

/* ============================= MODALS ============================= */
function Modal({ title, children, onClose, wide }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} bg-black border border-white/20 max-h-[90vh] overflow-y-auto`}>
        <div className="border-b border-white/10 px-5 py-3 flex items-center justify-between sticky top-0 bg-black">
          <div className="font-display font-bold uppercase tracking-widest text-xs">{title}</div>
          <button onClick={onClose} data-testid="modal-close"><X size={16}/></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, testid, value, onChange, type = 'text', required, as, children }) {
  const common = {
    'data-testid': testid, required, type, value: value ?? '',
    onChange: (e) => onChange(e.target.value),
    className: 'w-full bg-transparent border border-white/20 focus:border-white outline-none px-4 py-3 text-base',
  };
  return (
    <div className="mb-4">
      <label className="font-mono text-[10px] tracking-widest uppercase opacity-60 block mb-2">{label}</label>
      {children ? children : as === 'textarea' ? <textarea rows={4} {...common} /> : <input {...common} />}
    </div>
  );
}

function TaskModal({ team, initial, onClose, onDone }) {
  const [f, setF] = useState(initial || { title: '', description: '', status: 'todo', priority: 'medium', assignee_id: '', due_date: '', tags: [] });
  const editing = Boolean(initial);
  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...f, assignee_id: f.assignee_id || null, due_date: f.due_date || null };
    try {
      if (editing) { await api.patch(`/tasks/${initial.task_id}`, payload); toast.success('Task updated'); }
      else { await api.post('/tasks', payload); toast.success('Task created'); }
      onDone();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };
  return (
    <Modal wide title={editing ? 'EDIT TASK' : 'NEW TASK'} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="TITLE" testid="task-title" value={f.title} onChange={v => setF({ ...f, title: v })} required />
        <Field label="DESCRIPTION" testid="task-desc" value={f.description} onChange={v => setF({ ...f, description: v })} as="textarea" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="STATUS">
            <select data-testid="task-status" value={f.status} onChange={e => setF({ ...f, status: e.target.value })} className="w-full bg-black border border-white/20 focus:border-white outline-none px-4 py-3 text-base">
              {STATUS_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="PRIORITY">
            <select data-testid="task-priority" value={f.priority} onChange={e => setF({ ...f, priority: e.target.value })} className="w-full bg-black border border-white/20 focus:border-white outline-none px-4 py-3 text-base">
              {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="ASSIGNEE">
            <select data-testid="task-assignee" value={f.assignee_id || ''} onChange={e => setF({ ...f, assignee_id: e.target.value })} className="w-full bg-black border border-white/20 focus:border-white outline-none px-4 py-3 text-base">
              <option value="">UNASSIGNED</option>
              {team.map(u => <option key={u.user_id} value={u.user_id}>{u.name} · {u.role}</option>)}
            </select>
          </Field>
          <Field label="DUE DATE" testid="task-due" type="date" value={f.due_date || ''} onChange={v => setF({ ...f, due_date: v })} />
        </div>
        <button type="submit" data-testid="task-submit" className="w-full btn-inv py-3 font-display font-bold uppercase tracking-widest text-sm">{editing ? 'UPDATE' : 'CREATE'}</button>
      </form>
    </Modal>
  );
}

function EventModal({ initial, onClose, onDone }) {
  const [f, setF] = useState(initial || { title: '', description: '', date: '', location: '', category: 'Hackathon', capacity: 100, image_url: '', winners: [], photos: [], prize_pool: '' });
  const editing = Boolean(initial);
  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...f, capacity: Number(f.capacity), winners: Array.isArray(f.winners) ? f.winners : String(f.winners).split('\n').filter(Boolean), photos: Array.isArray(f.photos) ? f.photos : String(f.photos).split('\n').filter(Boolean) };
    try {
      if (editing) { await api.patch(`/events/${initial.event_id}`, payload); toast.success('Event updated'); }
      else { await api.post('/events', payload); toast.success('Event created'); }
      onDone();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };
  const winnersText = Array.isArray(f.winners) ? f.winners.join('\n') : (f.winners || '');
  const photosText = Array.isArray(f.photos) ? f.photos.join('\n') : (f.photos || '');
  return (
    <Modal wide title={editing ? 'EDIT EVENT' : 'NEW EVENT'} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="TITLE" testid="evt-title" value={f.title} onChange={v => setF({ ...f, title: v })} required />
        <Field label="DESCRIPTION" testid="evt-desc" value={f.description} onChange={v => setF({ ...f, description: v })} as="textarea" required={!editing} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="DATE (YYYY-MM-DD)" testid="evt-date" type="date" value={f.date} onChange={v => setF({ ...f, date: v })} required={!editing} />
          <Field label="CATEGORY" testid="evt-cat" value={f.category} onChange={v => setF({ ...f, category: v })} />
        </div>
        <Field label="LOCATION" testid="evt-loc" value={f.location} onChange={v => setF({ ...f, location: v })} required={!editing} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="CAPACITY" testid="evt-cap" type="number" value={f.capacity} onChange={v => setF({ ...f, capacity: v })} />
          <Field label="PRIZE POOL (OPTIONAL)" testid="evt-prize" value={f.prize_pool || ''} onChange={v => setF({ ...f, prize_pool: v })} />
        </div>
        <Field label="COVER IMAGE URL" testid="evt-img" value={f.image_url || ''} onChange={v => setF({ ...f, image_url: v })} />
        <Field label="WINNERS (ONE PER LINE)">
          <textarea data-testid="evt-winners" rows={3} value={winnersText} onChange={e => setF({ ...f, winners: e.target.value.split('\n') })} className="w-full bg-transparent border border-white/20 focus:border-white outline-none px-4 py-3 text-base" />
        </Field>
        <Field label="PHOTO URLS (ONE PER LINE)">
          <textarea data-testid="evt-photos" rows={3} value={photosText} onChange={e => setF({ ...f, photos: e.target.value.split('\n') })} className="w-full bg-transparent border border-white/20 focus:border-white outline-none px-4 py-3 text-base" />
        </Field>
        <button type="submit" data-testid="evt-submit" className="w-full btn-inv py-3 font-display font-bold uppercase tracking-widest text-sm">{editing ? 'UPDATE' : 'CREATE · NOTIFY MEMBERS'}</button>
      </form>
    </Modal>
  );
}

function NotifModal({ onClose, onDone }) {
  const [msg, setMsg] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try { await api.post('/notifications', { message: msg, active: true }); toast.success('Published'); onDone(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };
  return (
    <Modal title="NEW NOTIFICATION" onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="MESSAGE" testid="notif-msg" value={msg} onChange={setMsg} required />
        <button type="submit" data-testid="notif-submit" className="w-full btn-inv py-3 font-display font-bold uppercase tracking-widest text-sm">PUBLISH</button>
      </form>
    </Modal>
  );
}

function AnnModal({ onClose, onDone }) {
  const [f, setF] = useState({ title: '', body: '' });
  const submit = async (e) => {
    e.preventDefault();
    try { await api.post('/announcements', f); toast.success('Published'); onDone(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };
  return (
    <Modal title="NEW ANNOUNCEMENT" onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="TITLE" testid="ann-title" value={f.title} onChange={v => setF({ ...f, title: v })} required />
        <Field label="BODY" testid="ann-body" value={f.body} onChange={v => setF({ ...f, body: v })} as="textarea" required />
        <button type="submit" data-testid="ann-submit" className="w-full btn-inv py-3 font-display font-bold uppercase tracking-widest text-sm">PUBLISH</button>
      </form>
    </Modal>
  );
}
