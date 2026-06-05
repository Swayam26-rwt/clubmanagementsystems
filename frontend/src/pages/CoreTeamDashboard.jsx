import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth, formatApiErrorDetail } from '@/lib/auth';
import {
  LayoutGrid, CheckSquare, Users, Calendar, Megaphone, Radio, UserCheck, LogOut,
  Plus, Trash2, Check, X, Clock, ArrowUpRight, Search, Sparkles, Bell, ChevronRight,
  BarChart3, TrendingUp
} from 'lucide-react';

const STATUS_COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: 'bg-white/10',         dot: 'bg-white/40' },
  { id: 'in_progress', label: 'In Progress',  color: 'bg-violet-500/10',    dot: 'bg-violet-400' },
  { id: 'review',      label: 'Review',       color: 'bg-amber-500/10',     dot: 'bg-amber-400' },
  { id: 'done',        label: 'Done',         color: 'bg-emerald-500/10',   dot: 'bg-emerald-400' },
];

const PRIORITY_META = {
  urgent: { label: 'Urgent', class: 'badge-rose' },
  high:   { label: 'High',   class: 'badge-amber' },
  medium: { label: 'Med',    class: 'badge-violet' },
  low:    { label: 'Low',    class: 'badge-gray' },
};

const NAV = [
  { id: 'home',          label: 'Overview',      icon: LayoutGrid },
  { id: 'tasks',         label: 'Tasks',         icon: CheckSquare },
  { id: 'team',          label: 'Team',          icon: Users },
  { id: 'events',        label: 'Events',        icon: Calendar },
  { id: 'members',       label: 'Members',       icon: UserCheck },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'marquee',       label: 'Marquee Bar',   icon: Radio },
];

export default function CoreTeamDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('home');
  const [data, setData] = useState({
    tasks: [], team: [], events: [], members: [], pending: [], announcements: [], notifications: [],
  });
  const [modal, setModal] = useState(null);

  const load = async () => {
    try {
      const [t, team, e, m, p, a, n] = await Promise.all([
        api.get('/tasks'), api.get('/team'), api.get('/events'),
        api.get('/members'), api.get('/members/pending'),
        api.get('/announcements'), api.get('/notifications'),
      ]);
      setData({ tasks: t.data, team: team.data, events: e.data, members: m.data, pending: p.data, announcements: a.data, notifications: n.data });
    } catch { toast.error('Failed to load data'); }
  };
  useEffect(() => { load(); }, []);

  const onLogout = async () => { await logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-[#0d0f1a] text-white flex">

      {/* ── SIDEBAR ── */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col sticky top-0 h-screen border-r border-white/[0.06] bg-[#0f1222]">
        {/* Logo */}
        <Link to="/" data-testid="dash-home-link" className="h-16 px-5 flex items-center gap-3 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center shadow-lg shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-sm leading-tight">The Moment</div>
            <div className="text-[10px] text-white/40 font-mono">Core Dashboard</div>
          </div>
        </Link>

        {/* User card */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="glass p-3 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center font-bold text-sm shrink-0">
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">{user?.name}</div>
              <div className="text-[10px] text-white/40 font-mono">Core Team</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button key={item.id} data-testid={`nav-${item.id}`} onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${active ? 'nav-active font-semibold' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                <Icon size={16} className={active ? 'text-violet-400' : ''} />
                {item.label}
                {item.id === 'members' && data.pending.length > 0 && (
                  <span className="ml-auto badge badge-rose text-[10px] px-1.5 py-0.5">{data.pending.length}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/[0.06]">
          <button data-testid="dash-logout-btn" onClick={onLogout}
            className="w-full btn-ghost py-2 text-sm flex items-center justify-center gap-2 text-red-400/70 hover:text-red-400 border-red-400/20 hover:border-red-400/40 hover:bg-red-500/5">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#0f1222] border-b border-white/[0.06] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center">
            <Sparkles size={13} />
          </div>
          <span className="font-display font-bold text-sm">TMC · Core</span>
        </div>
        <button onClick={onLogout} className="btn-ghost py-1.5 px-3 text-xs text-red-400/70">Sign Out</button>
      </div>

      {/* ── MAIN ── */}
      <main className="flex-1 md:ml-0 pt-14 md:pt-0 min-w-0 overflow-x-hidden">
        {view === 'home'          && <HomeView data={data} setView={setView} user={user} />}
        {view === 'tasks'         && <TasksView data={data} reload={load} onOpenModal={setModal} />}
        {view === 'team'          && <TeamView data={data} />}
        {view === 'events'        && <EventsView data={data} reload={load} onOpenModal={setModal} />}
        {view === 'members'       && <MembersView data={data} reload={load} />}
        {view === 'announcements' && <AnnouncementsView data={data} reload={load} onOpenModal={setModal} />}
        {view === 'marquee'       && <MarqueeView data={data} reload={load} onOpenModal={setModal} />}
      </main>

      {/* Modals */}
      {modal?.type === 'task'  && <TaskModal  team={data.team} initial={modal.payload} onClose={() => setModal(null)} onDone={() => { setModal(null); load(); }} />}
      {modal?.type === 'event' && <EventModal initial={modal.payload} onClose={() => setModal(null)} onDone={() => { setModal(null); load(); }} />}
      {modal?.type === 'notif' && <NotifModal onClose={() => setModal(null)} onDone={() => { setModal(null); load(); }} />}
      {modal?.type === 'ann'   && <AnnModal   onClose={() => setModal(null)} onDone={() => { setModal(null); load(); }} />}
    </div>
  );
}

/* ── PAGE HEADER ── */
function ViewHeader({ title, subtitle, action, testid }) {
  return (
    <div className="px-6 md:px-8 pt-8 pb-6 flex flex-wrap items-start justify-between gap-4" data-testid={testid}>
      <div>
        <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">{title}</h1>
        {subtitle && <p className="text-white/45 mt-1 text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── HOME ── */
function HomeView({ data, setView, user }) {
  const openTasks = data.tasks.filter(t => t.status !== 'done').length;
  const doneTasks = data.tasks.filter(t => t.status === 'done').length;
  const upcoming  = data.events.filter(e => e.date >= new Date().toISOString().slice(0, 10));

  const kpis = [
    { label: 'Open Tasks',      value: openTasks,          color: 'from-violet-500 to-indigo-600', icon: CheckSquare },
    { label: 'Completed',       value: doneTasks,          color: 'from-emerald-500 to-teal-600',  icon: TrendingUp },
    { label: 'Upcoming Events', value: upcoming.length,    color: 'from-cyan-500 to-blue-600',     icon: Calendar },
    { label: 'Pending Members', value: data.pending.length,color: 'from-rose-500 to-pink-600',     icon: UserCheck },
  ];

  return (
    <div className="fade-in">
      <ViewHeader testid="home-header"
        title={`Hey, ${user?.name?.split(' ')[0] || 'Core'} 👋`}
        subtitle="Here's what's happening across the club today." />

      <div className="px-6 md:px-8 pb-8 space-y-8">
        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <div key={i} className="glass rounded-2xl p-5 hover-lift">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${k.color} grid place-items-center mb-3 shadow-lg`}>
                <k.icon size={16} className="text-white" />
              </div>
              <div className="stat-num text-3xl">{String(k.value).padStart(2, '0')}</div>
              <div className="text-xs text-white/45 mt-1 font-medium">{k.label}</div>
            </div>
          ))}
        </div>

        {/* 3-col cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <SectionCard title="Recent Tasks" icon={CheckSquare} onMore={() => setView('tasks')}>
            <ul className="space-y-2">
              {data.tasks.slice(0, 5).map(t => (
                <li key={t.task_id} className="flex items-center justify-between gap-2 py-2 border-b border-white/[0.06] last:border-0">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{t.title}</div>
                    <div className="text-xs text-white/40 mt-0.5">{t.status.replace('_', ' ')} · {t.assignee_name || 'Unassigned'}</div>
                  </div>
                  <PriorityChip p={t.priority} />
                </li>
              ))}
              {data.tasks.length === 0 && <li className="py-6 text-center text-white/30 text-sm">No tasks yet</li>}
            </ul>
          </SectionCard>

          <SectionCard title="Upcoming Events" icon={Calendar} onMore={() => setView('events')}>
            <ul className="space-y-2">
              {upcoming.slice(0, 5).map(e => (
                <li key={e.event_id} className="py-2 border-b border-white/[0.06] last:border-0">
                  <div className="text-sm font-semibold">{e.title}</div>
                  <div className="text-xs text-white/40 mt-0.5">{e.date} · {e.location}</div>
                </li>
              ))}
              {upcoming.length === 0 && <li className="py-6 text-center text-white/30 text-sm">No upcoming events</li>}
            </ul>
          </SectionCard>

          <SectionCard title="Pending Approvals" icon={UserCheck} onMore={() => setView('members')}
            badge={data.pending.length > 0 ? data.pending.length : null}>
            <ul className="space-y-2">
              {data.pending.slice(0, 5).map(m => (
                <li key={m.user_id} className="py-2 border-b border-white/[0.06] last:border-0">
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-xs text-white/40 mt-0.5">{m.email}</div>
                </li>
              ))}
              {data.pending.length === 0 && <li className="py-6 text-center text-white/30 text-sm">All caught up ✓</li>}
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, onMore, badge, children }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-violet-400" />}
          <span className="font-semibold text-sm">{title}</span>
          {badge && <span className="badge badge-rose text-[10px] px-1.5">{badge}</span>}
        </div>
        {onMore && (
          <button onClick={onMore} className="text-xs text-white/40 hover:text-violet-400 transition-colors flex items-center gap-1">
            View all <ChevronRight size={12} />
          </button>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function PriorityChip({ p }) {
  const meta = PRIORITY_META[p] || PRIORITY_META.medium;
  return <span className={`badge ${meta.class} text-[10px]`}>{meta.label}</span>;
}

function Avatar({ name, size = 'sm' }) {
  const initials = (name || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  const sz = size === 'lg' ? 'w-10 h-10 text-sm' : 'w-7 h-7 text-[11px]';
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center font-bold shrink-0`}>
      {initials}
    </div>
  );
}

/* ── TASKS KANBAN ── */
function TasksView({ data, reload, onOpenModal }) {
  const [filter, setFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [dragId, setDragId] = useState(null);

  const filtered = useMemo(() =>
    data.tasks.filter(t => {
      if (filter && !t.title.toLowerCase().includes(filter.toLowerCase())) return false;
      if (assigneeFilter && t.assignee_id !== assigneeFilter) return false;
      return true;
    }), [data.tasks, filter, assigneeFilter]);

  const grouped = useMemo(() => {
    const g = { todo: [], in_progress: [], review: [], done: [] };
    filtered.forEach(t => { if (g[t.status]) g[t.status].push(t); });
    return g;
  }, [filtered]);

  const onDrop = async (status, task_id) => {
    setDragId(null);
    const task = data.tasks.find(t => t.task_id === task_id);
    if (!task || task.status === status) return;
    try { await api.patch(`/tasks/${task_id}`, { status }); reload(); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };

  const delTask = async (id) => {
    try { await api.delete(`/tasks/${id}`); reload(); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };

  return (
    <div className="fade-in">
      <ViewHeader testid="tasks-header" title="Tasks" subtitle="Drag cards to change status."
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input data-testid="tasks-search-input" value={filter} onChange={e => setFilter(e.target.value)}
                placeholder="Search tasks…" className="inp pl-9 pr-3 py-2 text-xs w-44" />
            </div>
            <select data-testid="tasks-assignee-filter" value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)} className="inp py-2 text-xs">
              <option value="">All assignees</option>
              {data.team.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
            </select>
            <button data-testid="task-new-btn" onClick={() => onOpenModal({ type: 'task', payload: null })}
              className="btn-primary py-2 px-3 text-xs">
              <Plus size={13} /> New Task
            </button>
          </div>
        }
      />
      <div className="px-4 md:px-6 pb-8 overflow-x-auto no-scrollbar">
        <div className="grid grid-cols-4 gap-3 min-w-[900px]">
          {STATUS_COLUMNS.map(col => (
            <div key={col.id} data-testid={`col-${col.id}`}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { const id = e.dataTransfer.getData('text/plain'); onDrop(col.id, id); }}
              className={`rounded-xl border border-white/[0.07] ${col.color} min-h-[60vh] flex flex-col transition-all`}>
              <div className="flex items-center justify-between px-3.5 py-3 border-b border-white/[0.07]">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-xs font-semibold">{col.label}</span>
                </div>
                <span className="text-[10px] text-white/40 bg-white/[0.06] rounded-full px-2 py-0.5">{grouped[col.id].length}</span>
              </div>
              <div className="p-2 flex-1 flex flex-col gap-2">
                {grouped[col.id].map(t => (
                  <TaskCard key={t.task_id} t={t}
                    onClick={() => onOpenModal({ type: 'task', payload: t })}
                    onDelete={() => delTask(t.task_id)}
                    onDragStart={() => setDragId(t.task_id)} />
                ))}
                {grouped[col.id].length === 0 && (
                  <div className="flex-1 grid place-items-center text-white/20 text-xs py-8">Drop here</div>
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
    <article draggable onDragStart={e => { e.dataTransfer.setData('text/plain', t.task_id); onDragStart(); }}
      onClick={onClick} data-testid={`task-${t.task_id}`}
      className="glass rounded-xl p-3.5 cursor-grab active:cursor-grabbing hover:border-violet-500/30 transition-all hover-lift group">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold leading-snug flex-1">{t.title}</div>
        <button onClick={e => { e.stopPropagation(); onDelete(); }} data-testid={`task-del-${t.task_id}`}
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-rose-400 transition-opacity shrink-0 mt-0.5">
          <Trash2 size={12} />
        </button>
      </div>
      {t.description && <p className="text-xs text-white/40 mt-1.5 line-clamp-2">{t.description}</p>}
      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
        <PriorityChip p={t.priority} />
        {t.due_date && (
          <span className="badge badge-gray text-[10px] flex items-center gap-1">
            <Clock size={9} /> {t.due_date}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/[0.07]">
        <Avatar name={t.assignee_name || '?'} />
        <span className="text-[11px] text-white/40 truncate">{t.assignee_name || 'Unassigned'}</span>
      </div>
    </article>
  );
}

/* ── TEAM ── */
function TeamView({ data }) {
  return (
    <div className="fade-in">
      <ViewHeader testid="team-header" title="Team" subtitle="Core team & faculty mentors with their workload." />
      <div className="px-6 md:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.team.map(u => (
            <div key={u.user_id} className="glass rounded-2xl p-5 hover-lift" data-testid={`team-${u.user_id}`}>
              <div className="flex items-center justify-between mb-4">
                <Avatar name={u.name} size="lg" />
                <span className={`badge ${u.role === 'faculty' ? 'badge-cyan' : 'badge-violet'} text-[10px]`}>
                  {u.role.replace('_', ' ')}
                </span>
              </div>
              <div className="font-semibold">{u.name}</div>
              <div className="text-xs text-white/40 mt-0.5 truncate">{u.email}</div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/[0.04] rounded-lg p-3 text-center">
                  <div className="text-xl font-bold font-display text-violet-400">{String(u.open_tasks || 0).padStart(2, '0')}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">Open</div>
                </div>
                <div className="bg-white/[0.04] rounded-lg p-3 text-center">
                  <div className="text-xl font-bold font-display text-emerald-400">{String(u.done_tasks || 0).padStart(2, '0')}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">Done</div>
                </div>
              </div>
            </div>
          ))}
          {data.team.length === 0 && <div className="col-span-full glass rounded-2xl p-12 text-center text-white/30">No team members yet.</div>}
        </div>
      </div>
    </div>
  );
}

/* ── EVENTS ── */
function EventsView({ data, reload, onOpenModal }) {
  const del = async (id) => {
    try { await api.delete(`/events/${id}`); reload(); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };

  const CATEGORY_COLORS = { Hackathon: 'badge-violet', Workshop: 'badge-cyan', Conference: 'badge-amber', 'Tech Talk': 'badge-green', Summit: 'badge-rose' };

  return (
    <div className="fade-in">
      <ViewHeader testid="events-header" title="Events" subtitle="Create events & manage registrations."
        action={
          <button data-testid="event-new-btn" onClick={() => onOpenModal({ type: 'event', payload: null })} className="btn-primary py-2 px-4 text-sm">
            <Plus size={14} /> New Event
          </button>
        }
      />
      <div className="px-6 md:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.events.map(e => (
            <article key={e.event_id} className="glass rounded-2xl overflow-hidden hover-lift group" data-testid={`event-${e.event_id}`}>
              {e.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img src={e.image_url} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`badge ${CATEGORY_COLORS[e.category] || 'badge-gray'} text-[10px]`}>{e.category}</span>
                  <span className="text-[11px] text-white/40 font-mono">{e.date}</span>
                </div>
                <h3 className="font-display font-bold text-base leading-snug mb-1">{e.title}</h3>
                <p className="text-xs text-white/50 line-clamp-2">{e.description}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.07]">
                  <span className="text-xs text-white/40">{e.registered_count || 0} registered</span>
                  <div className="flex gap-2">
                    <button onClick={() => onOpenModal({ type: 'event', payload: e })} data-testid={`event-edit-${e.event_id}`}
                      className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium">Edit</button>
                    <button onClick={() => del(e.event_id)} data-testid={`event-del-${e.event_id}`}
                      className="text-rose-400/60 hover:text-rose-400 transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {data.events.length === 0 && <div className="col-span-full glass rounded-2xl p-12 text-center text-white/30">No events yet.</div>}
        </div>
      </div>
    </div>
  );
}

/* ── MEMBERS ── */
function MembersView({ data, reload }) {
  const approve = async (id) => { try { await api.post(`/members/${id}/approve`); reload(); } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); } };
  const reject  = async (id) => { try { await api.post(`/members/${id}/reject`);  reload(); } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); } };

  return (
    <div className="fade-in">
      <ViewHeader testid="members-header" title="Members" subtitle="Approve requests and browse the directory." />
      <div className="px-6 md:px-8 pb-8 space-y-6">
        {/* Pending */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
            <Bell size={14} className="text-rose-400" />
            <span className="font-semibold text-sm">Pending Approvals</span>
            {data.pending.length > 0 && <span className="badge badge-rose text-[10px] px-1.5">{data.pending.length}</span>}
          </div>
          <div className="divide-y divide-white/[0.06]">
            {data.pending.map(m => (
              <div key={m.user_id} className="px-5 py-4 flex items-center justify-between gap-4" data-testid={`pending-${m.user_id}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={m.name} />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{m.name}</div>
                    <div className="text-xs text-white/40 truncate">{m.email} · {m.department || '—'}</div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button data-testid={`approve-${m.user_id}`} onClick={() => approve(m.user_id)}
                    className="btn-primary py-1.5 px-3 text-xs"><Check size={12} /> Approve</button>
                  <button data-testid={`reject-${m.user_id}`} onClick={() => reject(m.user_id)}
                    className="btn-danger py-1.5 px-3 text-xs"><X size={12} /> Reject</button>
                </div>
              </div>
            ))}
            {data.pending.length === 0 && <div className="px-5 py-8 text-center text-white/30 text-sm">No pending requests ✓</div>}
          </div>
        </div>

        {/* Directory table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
            <Users size={14} className="text-violet-400" />
            <span className="font-semibold text-sm">Member Directory · {data.members.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-white/40 font-medium border-b border-white/[0.06]">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Dept</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data.members.map(m => (
                  <tr key={m.user_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-medium">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={m.name} />
                        {m.name}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-white/50 font-mono text-xs">{m.email}</td>
                    <td className="px-5 py-3 text-white/50">{m.department || '—'}</td>
                    <td className="px-5 py-3">
                      {m.approved
                        ? <span className="badge badge-green text-[10px]">Active</span>
                        : <span className="badge badge-gray text-[10px]">Pending</span>}
                    </td>
                  </tr>
                ))}
                {data.members.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-white/30">No members yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── ANNOUNCEMENTS ── */
function AnnouncementsView({ data, reload, onOpenModal }) {
  return (
    <div className="fade-in">
      <ViewHeader testid="ann-header" title="Announcements"
        action={<button data-testid="ann-new-btn" onClick={() => onOpenModal({ type: 'ann' })} className="btn-primary py-2 px-4 text-sm"><Plus size={14} /> New</button>}
      />
      <div className="px-6 md:px-8 pb-8">
        <div className="glass rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
          {data.announcements.map(a => (
            <div key={a.ann_id} className="p-5">
              <div className="font-semibold mb-1">{a.title}</div>
              <p className="text-sm text-white/60">{a.body}</p>
              <div className="text-xs text-white/30 mt-2">— {a.author_name} · {a.author_role}</div>
            </div>
          ))}
          {data.announcements.length === 0 && <div className="p-12 text-center text-white/30">No announcements yet.</div>}
        </div>
      </div>
    </div>
  );
}

/* ── MARQUEE ── */
function MarqueeView({ data, reload, onOpenModal }) {
  const del = async (id) => { try { await api.delete(`/notifications/${id}`); reload(); } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); } };
  return (
    <div className="fade-in">
      <ViewHeader testid="marquee-header" title="Marquee Bar" subtitle="Ticker on the public landing page."
        action={<button data-testid="notif-new-btn" onClick={() => onOpenModal({ type: 'notif' })} className="btn-primary py-2 px-4 text-sm"><Plus size={14} /> New</button>}
      />
      <div className="px-6 md:px-8 pb-8">
        <div className="glass rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
          {data.notifications.map(n => (
            <div key={n.notif_id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                <span className="text-sm font-mono">{n.message}</span>
              </div>
              <button onClick={() => del(n.notif_id)} data-testid={`notif-del-${n.notif_id}`}
                className="text-rose-400/50 hover:text-rose-400 transition-colors shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
          {data.notifications.length === 0 && <div className="p-12 text-center text-white/30">No active notifications.</div>}
        </div>
      </div>
    </div>
  );
}

/* ── MODALS ── */
function Modal({ title, children, onClose, wide }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md grid place-items-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className={`w-full ${wide ? 'max-w-xl' : 'max-w-md'} glass-strong rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] sticky top-0 bg-[#1a1e35]/90 backdrop-blur-sm rounded-t-2xl">
          <span className="font-display font-bold text-base">{title}</span>
          <button onClick={onClose} data-testid="modal-close" className="text-white/40 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function FieldRow({ label, testid, value, onChange, type = 'text', required, as, children }) {
  const common = {
    'data-testid': testid, required, type, value: value ?? '',
    onChange: (e) => onChange(e.target.value),
    className: 'inp',
  };
  return (
    <div className="mb-4">
      <label className="text-xs font-semibold text-white/50 uppercase tracking-widest block mb-1.5">{label}</label>
      {children ? children : as === 'textarea' ? <textarea rows={3} {...common} className="inp" /> : <input {...common} />}
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
    <Modal wide title={editing ? 'Edit Task' : 'New Task'} onClose={onClose}>
      <form onSubmit={submit}>
        <FieldRow label="Title" testid="task-title" value={f.title} onChange={v => setF({ ...f, title: v })} required />
        <FieldRow label="Description" testid="task-desc" value={f.description} onChange={v => setF({ ...f, description: v })} as="textarea" />
        <div className="grid grid-cols-2 gap-4">
          <FieldRow label="Status">
            <select data-testid="task-status" value={f.status} onChange={e => setF({ ...f, status: e.target.value })} className="inp">
              {STATUS_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </FieldRow>
          <FieldRow label="Priority">
            <select data-testid="task-priority" value={f.priority} onChange={e => setF({ ...f, priority: e.target.value })} className="inp">
              {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </FieldRow>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FieldRow label="Assignee">
            <select data-testid="task-assignee" value={f.assignee_id || ''} onChange={e => setF({ ...f, assignee_id: e.target.value })} className="inp">
              <option value="">Unassigned</option>
              {team.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
            </select>
          </FieldRow>
          <FieldRow label="Due Date" testid="task-due" type="date" value={f.due_date || ''} onChange={v => setF({ ...f, due_date: v })} />
        </div>
        <button type="submit" data-testid="task-submit" className="btn-primary w-full py-3 text-sm mt-2">{editing ? 'Update Task' : 'Create Task'}</button>
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
  const photosText  = Array.isArray(f.photos)  ? f.photos.join('\n')  : (f.photos  || '');
  return (
    <Modal wide title={editing ? 'Edit Event' : 'New Event'} onClose={onClose}>
      <form onSubmit={submit}>
        <FieldRow label="Title" testid="evt-title" value={f.title} onChange={v => setF({ ...f, title: v })} required />
        <FieldRow label="Description" testid="evt-desc" value={f.description} onChange={v => setF({ ...f, description: v })} as="textarea" required={!editing} />
        <div className="grid grid-cols-2 gap-4">
          <FieldRow label="Date" testid="evt-date" type="date" value={f.date} onChange={v => setF({ ...f, date: v })} required={!editing} />
          <FieldRow label="Category" testid="evt-cat" value={f.category} onChange={v => setF({ ...f, category: v })} />
        </div>
        <FieldRow label="Location" testid="evt-loc" value={f.location} onChange={v => setF({ ...f, location: v })} required={!editing} />
        <div className="grid grid-cols-2 gap-4">
          <FieldRow label="Capacity" testid="evt-cap" type="number" value={f.capacity} onChange={v => setF({ ...f, capacity: v })} />
          <FieldRow label="Prize Pool" testid="evt-prize" value={f.prize_pool || ''} onChange={v => setF({ ...f, prize_pool: v })} />
        </div>
        <FieldRow label="Cover Image URL" testid="evt-img" value={f.image_url || ''} onChange={v => setF({ ...f, image_url: v })} />
        <div className="mb-4">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-widest block mb-1.5">Winners (one per line)</label>
          <textarea data-testid="evt-winners" rows={3} value={winnersText} onChange={e => setF({ ...f, winners: e.target.value.split('\n') })} className="inp" />
        </div>
        <div className="mb-4">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-widest block mb-1.5">Photo URLs (one per line)</label>
          <textarea data-testid="evt-photos" rows={3} value={photosText} onChange={e => setF({ ...f, photos: e.target.value.split('\n') })} className="inp" />
        </div>
        <button type="submit" data-testid="evt-submit" className="btn-primary w-full py-3 text-sm mt-2">{editing ? 'Update Event' : 'Create Event'}</button>
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
    <Modal title="New Notification" onClose={onClose}>
      <form onSubmit={submit}>
        <FieldRow label="Message" testid="notif-msg" value={msg} onChange={setMsg} required />
        <button type="submit" data-testid="notif-submit" className="btn-primary w-full py-3 text-sm">Publish</button>
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
    <Modal title="New Announcement" onClose={onClose}>
      <form onSubmit={submit}>
        <FieldRow label="Title" testid="ann-title" value={f.title} onChange={v => setF({ ...f, title: v })} required />
        <FieldRow label="Body" testid="ann-body" value={f.body} onChange={v => setF({ ...f, body: v })} as="textarea" required />
        <button type="submit" data-testid="ann-submit" className="btn-primary w-full py-3 text-sm">Publish</button>
      </form>
    </Modal>
  );
}
