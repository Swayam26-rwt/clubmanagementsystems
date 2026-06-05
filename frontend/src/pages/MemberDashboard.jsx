import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardShell, { Panel, Stat } from './DashboardShell';
import { toast } from 'sonner';
import { Check, Calendar, Megaphone, Star, AlertCircle } from 'lucide-react';
import { useAuth, formatApiErrorDetail } from '@/lib/auth';

const CATEGORY_COLORS = {
  Hackathon: 'badge-violet', Workshop: 'badge-cyan', Conference: 'badge-amber',
  'Tech Talk': 'badge-green', Summit: 'badge-rose',
};

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
    try { await api.post(`/events/${id}/register`); toast.success('Registered! 🎉'); load(); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };

  return (
    <DashboardShell accent="MEMBER"
      title={`Hey, ${user?.name?.split(' ')[0] || 'Builder'} 👋`}
      subtitle="Your upcoming events, announcements, and registrations.">

      {!user?.approved && (
        <div className="glass rounded-xl p-4 mb-6 flex items-start gap-3 border border-amber-500/25 bg-amber-500/5" data-testid="pending-banner">
          <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200/80">
            Your membership is <span className="font-semibold text-amber-400">pending Core Team approval</span>.
            You can browse events, but some features may be limited until approved.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat testid="m-stat-events"  label="Upcoming Events"     value={events.length}         color="text-violet-400" />
        <Stat testid="m-stat-regs"   label="Your Registrations"  value={regs.length}           color="text-cyan-400" />
        <Stat testid="m-stat-ann"    label="Announcements"       value={announcements.length}   color="text-rose-400" />
        <Stat testid="m-stat-status" label="Status"              value={user?.approved ? '✓' : '…'} color={user?.approved ? 'text-emerald-400' : 'text-amber-400'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Events list */}
        <Panel testid="m-events" title="Events" icon={Calendar} className="lg:col-span-2">
          <ul className="space-y-3">
            {events.map(e => (
              <li key={e.event_id} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors" data-testid={`m-event-${e.event_id}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`badge ${CATEGORY_COLORS[e.category] || 'badge-gray'} text-[10px]`}>{e.category}</span>
                    <span className="text-xs text-white/40 font-mono">{e.date}</span>
                  </div>
                  <div className="font-semibold text-sm">{e.title}</div>
                  <div className="text-xs text-white/45 mt-0.5">{e.location}</div>
                  <p className="text-xs text-white/55 mt-1.5 line-clamp-2">{e.description}</p>
                </div>
                <div className="shrink-0 mt-1">
                  {regIds.has(e.event_id) ? (
                    <span className="badge badge-green text-[10px] flex items-center gap-1"><Check size={10} /> Registered</span>
                  ) : (
                    <button data-testid={`m-reg-${e.event_id}`} onClick={() => register(e.event_id)}
                      className="btn-primary py-1.5 px-3 text-xs">Register</button>
                  )}
                </div>
              </li>
            ))}
            {events.length === 0 && <li className="py-8 text-center text-white/30 text-sm">No events yet.</li>}
          </ul>
        </Panel>

        <div className="space-y-5">
          {/* Announcements */}
          <Panel testid="m-announcements" title="Announcements" icon={Megaphone}>
            <ul className="space-y-3">
              {announcements.map(a => (
                <li key={a.ann_id} className="pb-3 border-b border-white/[0.06] last:border-0 last:pb-0">
                  <div className="font-semibold text-sm">{a.title}</div>
                  <p className="text-xs text-white/55 mt-1">{a.body}</p>
                  <div className="text-[10px] text-white/30 mt-1.5">— {a.author_name}</div>
                </li>
              ))}
              {announcements.length === 0 && <li className="py-4 text-center text-white/30 text-sm">Nothing new.</li>}
            </ul>
          </Panel>

          {/* My registrations */}
          <Panel testid="m-regs" title="My Registrations" icon={Star}>
            <ul className="space-y-2">
              {regs.map(r => {
                const e = events.find(x => x.event_id === r.event_id);
                return (
                  <li key={r.event_id} className="py-2 border-b border-white/[0.06] last:border-0">
                    <div className="text-sm font-semibold">{e?.title || r.event_id}</div>
                    <div className="text-xs text-white/40 mt-0.5">{e?.date} · {e?.location}</div>
                  </li>
                );
              })}
              {regs.length === 0 && <li className="py-4 text-center text-white/30 text-sm">No registrations yet.</li>}
            </ul>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
