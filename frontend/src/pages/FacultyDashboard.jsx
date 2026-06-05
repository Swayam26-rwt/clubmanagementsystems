import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardShell, { Panel, Stat } from './DashboardShell';
import { toast } from 'sonner';
import { Check, X, Calendar, Users, FileText, History } from 'lucide-react';
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

  const pending  = proposals.filter(p => p.status === 'pending');
  const decided  = proposals.filter(p => p.status !== 'pending');

  return (
    <DashboardShell accent="FACULTY" title="Faculty Overview" subtitle="Review proposals, monitor events, and track members.">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat testid="f-stat-events"    label="Total Events"       value={events.length}                     color="text-violet-400" />
        <Stat testid="f-stat-pending"   label="Pending Proposals"  value={pending.length}                    color="text-amber-400" />
        <Stat testid="f-stat-members"   label="Active Members"     value={members.filter(m => m.approved).length} color="text-cyan-400" />
        <Stat testid="f-stat-decisions" label="Decisions Made"     value={decided.length}                    color="text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending proposals */}
        <Panel title={`Proposals · ${pending.length} Pending`} icon={FileText} testid="panel-proposals">
          <ul className="space-y-3">
            {pending.map(p => (
              <li key={p.proposal_id} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15" data-testid={`proposal-${p.proposal_id}`}>
                <div className="font-semibold text-sm mb-1">{p.title}</div>
                <p className="text-xs text-white/55 mb-2">{p.description}</p>
                <div className="text-[10px] text-white/35 mb-3">Submitted by {p.submitted_by}</div>
                <div className="flex gap-2">
                  <button data-testid={`approve-${p.proposal_id}`} onClick={() => decide(p.proposal_id, 'approve')}
                    className="btn-primary py-1.5 px-3 text-xs"><Check size={12} /> Approve</button>
                  <button data-testid={`reject-${p.proposal_id}`} onClick={() => decide(p.proposal_id, 'reject')}
                    className="btn-danger py-1.5 px-3 text-xs"><X size={12} /> Reject</button>
                </div>
              </li>
            ))}
            {pending.length === 0 && <li className="py-8 text-center text-white/30 text-sm">No pending proposals ✓</li>}
          </ul>
        </Panel>

        {/* Upcoming events */}
        <Panel title="Events" icon={Calendar} testid="panel-f-events">
          <ul className="space-y-2">
            {events.slice(0, 8).map(e => (
              <li key={e.event_id} className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
                <div>
                  <div className="text-sm font-semibold">{e.title}</div>
                  <div className="text-xs text-white/40 mt-0.5">{e.category} · {e.date} · {e.location}</div>
                </div>
                <span className="badge badge-gray text-[10px] shrink-0 ml-3">{e.registered_count || 0} reg</span>
              </li>
            ))}
            {events.length === 0 && <li className="py-8 text-center text-white/30 text-sm">No events yet.</li>}
          </ul>
        </Panel>

        {/* Member directory */}
        <Panel title="Member Directory" icon={Users} testid="panel-f-members">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-white/40 font-medium border-b border-white/[0.06]">
                  <th className="pb-2.5 pr-4">Name</th>
                  <th className="pb-2.5 pr-4">Dept</th>
                  <th className="pb-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {members.map(m => (
                  <tr key={m.user_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 pr-4 font-medium text-sm">{m.name}</td>
                    <td className="py-2.5 pr-4 text-white/50 text-xs">{m.department || '—'}</td>
                    <td className="py-2.5">
                      {m.approved
                        ? <span className="badge badge-green text-[10px]">Active</span>
                        : <span className="badge badge-gray text-[10px]">Pending</span>}
                    </td>
                  </tr>
                ))}
                {members.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-white/30 text-sm">No members yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Decision history */}
        <Panel title="Decision History" icon={History} testid="panel-f-history">
          <ul className="space-y-2">
            {decided.map(p => (
              <li key={p.proposal_id} className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
                <div>
                  <div className="text-sm font-semibold">{p.title}</div>
                  <div className="text-xs text-white/40 mt-0.5">{p.submitted_by}</div>
                </div>
                <span className={`badge text-[10px] shrink-0 ml-3 ${p.status === 'approved' ? 'badge-green' : 'badge-rose'}`}>
                  {p.status}
                </span>
              </li>
            ))}
            {decided.length === 0 && <li className="py-8 text-center text-white/30 text-sm">No decisions yet.</li>}
          </ul>
        </Panel>
      </div>
    </DashboardShell>
  );
}
