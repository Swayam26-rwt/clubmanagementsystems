import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { LogOut, Sparkles } from 'lucide-react';

const ACCENT_STYLES = {
  MEMBER:  { badge: 'badge-rose',   from: 'from-rose-500',    to: 'to-pink-600' },
  FACULTY: { badge: 'badge-cyan',   from: 'from-cyan-500',    to: 'to-blue-600' },
  CORE:    { badge: 'badge-violet', from: 'from-violet-500',  to: 'to-indigo-600' },
};

export default function DashboardShell({ title, subtitle, children, accent = 'CORE' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const styles = ACCENT_STYLES[accent] || ACCENT_STYLES.CORE;

  const onLogout = async () => { await logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-[#0d0f1a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0d0f1a]/80 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-15 py-3 flex items-center justify-between gap-4">
          <Link to="/" data-testid="dash-home-link" className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${styles.from} ${styles.to} grid place-items-center shadow-lg shrink-0`}>
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="font-display font-bold text-sm hidden sm:block">The Moment Club</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 glass px-3 py-2 rounded-lg">
              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${styles.from} ${styles.to} grid place-items-center text-[10px] font-bold shrink-0`}>
                {(user?.name || 'U')[0]}
              </div>
              <div>
                <div className="text-xs font-semibold leading-tight">{user?.name}</div>
                <div className={`text-[10px] font-mono ${styles.badge === 'badge-violet' ? 'text-violet-400' : styles.badge === 'badge-cyan' ? 'text-cyan-400' : 'text-rose-400'}`}>{accent}</div>
              </div>
            </div>
            <button data-testid="dash-logout-btn" onClick={onLogout}
              className="btn-ghost py-2 px-3 text-xs text-red-400/70 hover:text-red-400 border-red-400/20 hover:border-red-400/40 hover:bg-red-500/5">
              <LogOut size={13} /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-8">
        {/* Page title */}
        <div className="mb-8">
          <span className={`badge ${styles.badge} text-[10px] mb-3`}>§ {accent} DASHBOARD</span>
          <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight">{title}</h1>
          {subtitle && <p className="text-white/50 mt-2 text-sm">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}

export function Panel({ title, action, children, testid, icon: Icon }) {
  return (
    <div className="glass rounded-2xl overflow-hidden" data-testid={testid}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 font-semibold text-sm">
          {Icon && <Icon size={14} className="text-violet-400" />}
          {title}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Stat({ label, value, testid, color = 'text-violet-400' }) {
  return (
    <div className="glass rounded-2xl p-5 hover-lift" data-testid={testid}>
      <div className="text-xs text-white/45 font-medium mb-2">{label}</div>
      <div className={`font-display font-bold text-3xl tabular-nums ${color}`}>
        {String(value).padStart(2, '0')}
      </div>
    </div>
  );
}
