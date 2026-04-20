import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardShell, { Panel, Stat } from './DashboardShell';
import { toast } from 'sonner';
import { Check, ArrowUpRight } from 'lucide-react';
import { useAuth, formatApiErrorDetail } from '@/lib/auth';

export default function MemberDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [regs, setRegs] = useState([]);

  const load = async () => {
    const [e, a, r] = await Promise.all([
      api.get('/events'), api.get('/announcements'), api.get('/me/registrations'),
    ]);
    setEvents(e.data); setAnnouncements(a.data); setRegs(r.data);
  };
  useEffect(() => { load(); }, []);

  const regIds = new Set(regs.map(r => r.event_id));

  const register = async (id) => {
    try { await api.post(`/events/${id}/register`); toast.success('Registered'); load(); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };

  return (
    <DashboardShell accent="MEMBER" title={`Hey, ${user?.name?.split(' ')[0] || 'Builder'}.`} subtitle="Events, announcements, and everything you're signed up for.">
      {!user?.approved && (
        <div className="border border-white/30 p-4 mb-8 font-mono text-xs uppercase tracking-wide" data-testid="pending-banner">
          YOUR MEMBERSHIP IS PENDING CORE TEAM APPROVAL. YOU CAN BROWSE EVENTS, BUT REGISTRATIONS ARE LIMITED.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat testid="m-stat-events" label="UPCOMING EVENTS" value={events.length} />
        <Stat testid="m-stat-regs" label="YOUR REGISTRATIONS" value={regs.length} />
        <Stat testid="m-stat-ann" label="ANNOUNCEMENTS" value={announcements.length} />
        <Stat testid="m-stat-status" label="STATUS" value={user?.approved ? 'OK' : '…'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel testid="m-events" title="EVENTS">
          <ul className="divide-y divide-white/10">
            {events.map(e => (
              <li key={e.event_id} className="py-4 flex items-start justify-between gap-4" data-testid={`m-event-${e.event_id}`}>
                <div className="flex-1">
                  <div className="font-display font-bold uppercase tracking-tight">{e.title}</div>
                  <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-1">{e.category} · {e.date} · {e.location}</div>
                  <p className="text-sm text-white/75 mt-2">{e.description}</p>
                </div>
                {regIds.has(e.event_id) ? (
                  <span className="border border-white/30 px-3 py-1.5 text-[10px] uppercase tracking-widest inline-flex items-center gap-1"><Check size={12}/> REGISTERED</span>
                ) : (
                  <button data-testid={`m-reg-${e.event_id}`} onClick={() => register(e.event_id)} className="btn-inv px-3 py-1.5 font-display font-bold uppercase text-[10px] tracking-widest inline-flex items-center gap-1">REGISTER <ArrowUpRight size={12}/></button>
                )}
              </li>
            ))}
            {events.length === 0 && <li className="py-8 text-center text-white/50 text-sm">No events.</li>}
          </ul>
        </Panel>

        <Panel testid="m-announcements" title="ANNOUNCEMENTS">
          <ul className="divide-y divide-white/10">
            {announcements.map(a => (
              <li key={a.ann_id} className="py-3">
                <div className="font-display font-bold uppercase tracking-tight">{a.title}</div>
                <div className="text-sm text-white/75 mt-1">{a.body}</div>
                <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-1">— {a.author_name} · {a.author_role}</div>
              </li>
            ))}
            {announcements.length === 0 && <li className="py-8 text-center text-white/50 text-sm">Nothing new.</li>}
          </ul>
        </Panel>

        <Panel testid="m-regs" title="YOUR REGISTRATIONS">
          <ul className="divide-y divide-white/10">
            {regs.map(r => {
              const e = events.find(x => x.event_id === r.event_id);
              return (
                <li key={r.event_id} className="py-3">
                  <div className="font-display font-bold uppercase tracking-tight">{e?.title || r.event_id}</div>
                  <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-1">{e?.date} · {e?.location}</div>
                </li>
              );
            })}
            {regs.length === 0 && <li className="py-8 text-center text-white/50 text-sm">No registrations yet.</li>}
          </ul>
        </Panel>
      </div>
    </DashboardShell>
  );
}
