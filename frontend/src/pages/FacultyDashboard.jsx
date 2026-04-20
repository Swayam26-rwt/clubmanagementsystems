import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardShell, { Panel, Stat } from './DashboardShell';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { formatApiErrorDetail } from '@/lib/auth';

export default function FacultyDashboard() {
  const [events, setEvents] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [members, setMembers] = useState([]);

  const load = async () => {
    const [e, p, m] = await Promise.all([
      api.get('/events'), api.get('/proposals'), api.get('/members'),
    ]);
    setEvents(e.data); setProposals(p.data); setMembers(m.data);
  };
  useEffect(() => { load(); }, []);

  const decide = async (id, dec) => {
    try { await api.post(`/proposals/${id}/${dec}`); toast.success(`Proposal ${dec}d`); load(); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };

  const pending = proposals.filter(p => p.status === 'pending');

  return (
    <DashboardShell accent="FACULTY" title="Oversight." subtitle="Approve proposals, review members, monitor events.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat testid="f-stat-events" label="EVENTS" value={events.length} />
        <Stat testid="f-stat-pending" label="PENDING PROPOSALS" value={pending.length} />
        <Stat testid="f-stat-members" label="MEMBERS" value={members.filter(m => m.approved).length} />
        <Stat testid="f-stat-decisions" label="DECISIONS MADE" value={proposals.length - pending.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="PROPOSALS · PENDING REVIEW" testid="panel-proposals">
          <ul className="divide-y divide-white/10">
            {pending.map(p => (
              <li key={p.proposal_id} className="py-3 flex items-start justify-between gap-3" data-testid={`proposal-${p.proposal_id}`}>
                <div className="flex-1">
                  <div className="font-display font-bold uppercase tracking-tight">{p.title}</div>
                  <div className="text-sm text-white/80 mt-1">{p.description}</div>
                  <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-1">SUBMITTED BY {p.submitted_by}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button data-testid={`approve-${p.proposal_id}`} onClick={() => decide(p.proposal_id, 'approve')} className="btn-inv px-3 py-1.5 font-display font-bold uppercase text-[10px] tracking-widest inline-flex items-center gap-1"><Check size={12}/> Approve</button>
                  <button data-testid={`reject-${p.proposal_id}`} onClick={() => decide(p.proposal_id, 'reject')} className="btn-outline-w px-3 py-1.5 font-display font-bold uppercase text-[10px] tracking-widest inline-flex items-center gap-1"><X size={12}/> Reject</button>
                </div>
              </li>
            ))}
            {pending.length === 0 && <li className="py-8 text-center text-white/50 text-sm">No pending proposals.</li>}
          </ul>
        </Panel>

        <Panel title="UPCOMING EVENTS" testid="panel-f-events">
          <ul className="divide-y divide-white/10">
            {events.map(e => (
              <li key={e.event_id} className="py-3">
                <div className="font-display font-bold uppercase tracking-tight">{e.title}</div>
                <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-1">{e.category} · {e.date} · {e.location}</div>
              </li>
            ))}
            {events.length === 0 && <li className="py-8 text-center text-white/50 text-sm">No events.</li>}
          </ul>
        </Panel>

        <Panel title="MEMBER DIRECTORY" testid="panel-f-members">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-[10px] tracking-widest uppercase opacity-60">
                  <th className="pb-2">NAME</th>
                  <th className="pb-2">EMAIL</th>
                  <th className="pb-2">DEPT</th>
                  <th className="pb-2">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.user_id} className="border-t border-white/10">
                    <td className="py-2 font-display font-semibold uppercase">{m.name}</td>
                    <td className="py-2 font-mono text-xs">{m.email}</td>
                    <td className="py-2">{m.department || '—'}</td>
                    <td className="py-2">{m.approved ? <span className="border border-white/30 px-2 py-0.5 text-[10px] uppercase tracking-widest">ACTIVE</span> : <span className="opacity-60 text-[10px] uppercase tracking-widest">PENDING</span>}</td>
                  </tr>
                ))}
                {members.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-white/50 text-sm">No members yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="DECISION HISTORY" testid="panel-f-history">
          <ul className="divide-y divide-white/10">
            {proposals.filter(p => p.status !== 'pending').map(p => (
              <li key={p.proposal_id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-display font-bold uppercase tracking-tight">{p.title}</div>
                  <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-1">{p.submitted_by}</div>
                </div>
                <span className="border border-white/30 px-2 py-1 text-[10px] uppercase tracking-widest">{p.status}</span>
              </li>
            ))}
            {proposals.filter(p => p.status !== 'pending').length === 0 && <li className="py-8 text-center text-white/50 text-sm">No decisions yet.</li>}
          </ul>
        </Panel>
      </div>
    </DashboardShell>
  );
}
