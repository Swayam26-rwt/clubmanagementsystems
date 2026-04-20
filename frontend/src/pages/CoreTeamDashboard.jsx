import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardShell, { Panel, Stat } from './DashboardShell';
import { toast } from 'sonner';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { formatApiErrorDetail } from '@/lib/auth';

export default function CoreTeamDashboard() {
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pending, setPending] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [showEvt, setShowEvt] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showAnn, setShowAnn] = useState(false);

  const load = async () => {
    const [e, n, p, a] = await Promise.all([
      api.get('/events'), api.get('/notifications'),
      api.get('/members/pending'), api.get('/announcements'),
    ]);
    setEvents(e.data); setNotifications(n.data); setPending(p.data); setAnnouncements(a.data);
  };

  useEffect(() => { load(); }, []);

  const approveMember = async (id) => {
    try { await api.post(`/members/${id}/approve`); toast.success('Member approved'); load(); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };
  const rejectMember = async (id) => {
    try { await api.post(`/members/${id}/reject`); toast.success('Rejected'); load(); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };
  const deleteEvent = async (id) => {
    try { await api.delete(`/events/${id}`); toast.success('Event deleted'); load(); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };
  const deleteNotif = async (id) => {
    try { await api.delete(`/notifications/${id}`); toast.success('Deleted'); load(); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };

  return (
    <DashboardShell accent="CORE TEAM" title="Command Deck." subtitle="Manage events, publish notifications, approve member requests.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat testid="stat-events" label="EVENTS" value={events.length} />
        <Stat testid="stat-notifs" label="ACTIVE NOTIFICATIONS" value={notifications.length} />
        <Stat testid="stat-pending" label="PENDING MEMBERS" value={pending.length} />
        <Stat testid="stat-ann" label="ANNOUNCEMENTS" value={announcements.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel
          testid="panel-events"
          title="EVENTS"
          action={<button data-testid="add-event-btn" onClick={() => setShowEvt(true)} className="btn-outline-w px-3 py-1.5 font-display font-bold uppercase text-[10px] tracking-widest inline-flex items-center gap-2"><Plus size={12}/> New</button>}
        >
          <ul className="divide-y divide-white/10">
            {events.map(e => (
              <li key={e.event_id} className="py-3 flex items-start justify-between gap-3" data-testid={`event-row-${e.event_id}`}>
                <div>
                  <div className="font-display font-bold uppercase tracking-tight">{e.title}</div>
                  <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-1">{e.category} · {e.date} · {e.location} · {e.registered_count || 0} REGISTERED</div>
                </div>
                <button onClick={() => deleteEvent(e.event_id)} data-testid={`delete-event-${e.event_id}`} className="opacity-60 hover:opacity-100"><Trash2 size={16}/></button>
              </li>
            ))}
            {events.length === 0 && <li className="py-8 text-center text-white/50 text-sm">No events yet.</li>}
          </ul>
        </Panel>

        <Panel
          testid="panel-notifications"
          title="NOTIFICATION MARQUEE"
          action={<button data-testid="add-notif-btn" onClick={() => setShowNotif(true)} className="btn-outline-w px-3 py-1.5 font-display font-bold uppercase text-[10px] tracking-widest inline-flex items-center gap-2"><Plus size={12}/> New</button>}
        >
          <ul className="divide-y divide-white/10">
            {notifications.map(n => (
              <li key={n.notif_id} className="py-3 flex items-start justify-between gap-3">
                <div className="font-mono text-xs tracking-wide uppercase">{n.message}</div>
                <button onClick={() => deleteNotif(n.notif_id)} data-testid={`delete-notif-${n.notif_id}`} className="opacity-60 hover:opacity-100"><Trash2 size={14}/></button>
              </li>
            ))}
            {notifications.length === 0 && <li className="py-8 text-center text-white/50 text-sm">No active notifications.</li>}
          </ul>
        </Panel>

        <Panel testid="panel-pending" title="PENDING MEMBER APPROVALS">
          <ul className="divide-y divide-white/10">
            {pending.map(m => (
              <li key={m.user_id} className="py-3 flex items-center justify-between gap-3" data-testid={`pending-row-${m.user_id}`}>
                <div>
                  <div className="font-display font-bold uppercase tracking-tight">{m.name}</div>
                  <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-1">{m.email} · {m.department || '—'}</div>
                </div>
                <div className="flex gap-2">
                  <button data-testid={`approve-${m.user_id}`} onClick={() => approveMember(m.user_id)} className="btn-inv px-3 py-1.5 font-display font-bold uppercase text-[10px] tracking-widest inline-flex items-center gap-1"><Check size={12}/> Approve</button>
                  <button data-testid={`reject-${m.user_id}`} onClick={() => rejectMember(m.user_id)} className="btn-outline-w px-3 py-1.5 font-display font-bold uppercase text-[10px] tracking-widest inline-flex items-center gap-1"><X size={12}/> Reject</button>
                </div>
              </li>
            ))}
            {pending.length === 0 && <li className="py-8 text-center text-white/50 text-sm">No pending requests.</li>}
          </ul>
        </Panel>

        <Panel
          testid="panel-announcements"
          title="ANNOUNCEMENTS"
          action={<button data-testid="add-ann-btn" onClick={() => setShowAnn(true)} className="btn-outline-w px-3 py-1.5 font-display font-bold uppercase text-[10px] tracking-widest inline-flex items-center gap-2"><Plus size={12}/> New</button>}
        >
          <ul className="divide-y divide-white/10">
            {announcements.map(a => (
              <li key={a.ann_id} className="py-3">
                <div className="font-display font-bold uppercase tracking-tight">{a.title}</div>
                <div className="text-sm text-white/80 mt-1">{a.body}</div>
                <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-1">— {a.author_name} · {a.author_role}</div>
              </li>
            ))}
            {announcements.length === 0 && <li className="py-8 text-center text-white/50 text-sm">No announcements.</li>}
          </ul>
        </Panel>
      </div>

      {showEvt && <EventModal onClose={() => setShowEvt(false)} onDone={() => { setShowEvt(false); load(); }} />}
      {showNotif && <NotifModal onClose={() => setShowNotif(false)} onDone={() => { setShowNotif(false); load(); }} />}
      {showAnn && <AnnModal onClose={() => setShowAnn(false)} onDone={() => { setShowAnn(false); load(); }} />}
    </DashboardShell>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-black border border-white/20">
        <div className="border-b border-white/10 px-5 py-3 flex items-center justify-between">
          <div className="font-display font-bold uppercase tracking-widest text-xs">{title}</div>
          <button onClick={onClose} data-testid="modal-close"><X size={16}/></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Inp({ label, testid, value, onChange, type = 'text', required, as }) {
  const common = {
    'data-testid': testid, required, type, value,
    onChange: (e) => onChange(e.target.value),
    className: 'w-full bg-transparent border border-white/20 focus:border-white outline-none px-4 py-3 text-base',
  };
  return (
    <div className="mb-4">
      <label className="font-mono text-[10px] tracking-widest uppercase opacity-60 block mb-2">{label}</label>
      {as === 'textarea' ? <textarea rows={4} {...common} /> : <input {...common} />}
    </div>
  );
}

function EventModal({ onClose, onDone }) {
  const [f, setF] = useState({ title: '', description: '', date: '', location: '', category: 'Hackathon', capacity: 100, image_url: '' });
  const submit = async (e) => {
    e.preventDefault();
    try { await api.post('/events', { ...f, capacity: Number(f.capacity) }); toast.success('Event created · members notified'); onDone(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };
  return (
    <Modal title="NEW EVENT" onClose={onClose}>
      <form onSubmit={submit}>
        <Inp label="TITLE" testid="evt-title" value={f.title} onChange={v => setF({ ...f, title: v })} required />
        <Inp label="DESCRIPTION" testid="evt-desc" value={f.description} onChange={v => setF({ ...f, description: v })} as="textarea" required />
        <Inp label="DATE (YYYY-MM-DD)" testid="evt-date" value={f.date} onChange={v => setF({ ...f, date: v })} required />
        <Inp label="LOCATION" testid="evt-loc" value={f.location} onChange={v => setF({ ...f, location: v })} required />
        <Inp label="CATEGORY" testid="evt-cat" value={f.category} onChange={v => setF({ ...f, category: v })} />
        <Inp label="CAPACITY" testid="evt-cap" value={f.capacity} onChange={v => setF({ ...f, capacity: v })} type="number" />
        <Inp label="IMAGE URL (OPTIONAL)" testid="evt-img" value={f.image_url} onChange={v => setF({ ...f, image_url: v })} />
        <button type="submit" data-testid="evt-submit" className="w-full btn-inv py-3 font-display font-bold uppercase tracking-widest text-sm">CREATE · NOTIFY MEMBERS</button>
      </form>
    </Modal>
  );
}

function NotifModal({ onClose, onDone }) {
  const [msg, setMsg] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try { await api.post('/notifications', { message: msg, active: true }); toast.success('Added to marquee'); onDone(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };
  return (
    <Modal title="NEW NOTIFICATION" onClose={onClose}>
      <form onSubmit={submit}>
        <Inp label="MESSAGE" testid="notif-msg" value={msg} onChange={setMsg} required />
        <button type="submit" data-testid="notif-submit" className="w-full btn-inv py-3 font-display font-bold uppercase tracking-widest text-sm">PUBLISH</button>
      </form>
    </Modal>
  );
}

function AnnModal({ onClose, onDone }) {
  const [f, setF] = useState({ title: '', body: '' });
  const submit = async (e) => {
    e.preventDefault();
    try { await api.post('/announcements', f); toast.success('Announcement published'); onDone(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };
  return (
    <Modal title="NEW ANNOUNCEMENT" onClose={onClose}>
      <form onSubmit={submit}>
        <Inp label="TITLE" testid="ann-title" value={f.title} onChange={v => setF({ ...f, title: v })} required />
        <Inp label="BODY" testid="ann-body" value={f.body} onChange={v => setF({ ...f, body: v })} as="textarea" required />
        <button type="submit" data-testid="ann-submit" className="w-full btn-inv py-3 font-display font-bold uppercase tracking-widest text-sm">PUBLISH</button>
      </form>
    </Modal>
  );
}
