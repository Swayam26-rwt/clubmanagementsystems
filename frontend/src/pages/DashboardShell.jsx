import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { LogOut } from 'lucide-react';

export default function DashboardShell({ title, subtitle, children, accent = 'CORE' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => { await logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link to="/" data-testid="dash-home-link" className="flex items-center gap-3">
            <div className="w-8 h-8 border border-white/60 grid place-items-center font-display font-black text-[10px]">TMC</div>
            <div className="font-display font-black uppercase tracking-[0.2em] text-sm">The Moment Club</div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block font-mono text-[10px] tracking-widest uppercase opacity-70 border border-white/20 px-3 py-1.5">
              {accent} · {user?.name}
            </div>
            <button data-testid="dash-logout-btn" onClick={onLogout} className="btn-outline-w px-3 py-2 font-display font-bold uppercase text-xs tracking-widest inline-flex items-center gap-2">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 md:px-10 py-10">
        <div className="mb-10">
          <div className="font-mono text-xs tracking-[0.3em] uppercase opacity-70 mb-2">§ {accent} DASHBOARD</div>
          <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">{title}</h1>
          {subtitle && <p className="text-white/70 mt-3 max-w-2xl">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}

export function Panel({ title, action, children, testid }) {
  return (
    <section className="border border-white/10" data-testid={testid}>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="font-display font-bold uppercase tracking-widest text-xs">{title}</div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, testid }) {
  return (
    <div className="border border-white/10 p-5" data-testid={testid}>
      <div className="font-mono text-[10px] tracking-widest uppercase opacity-60">{label}</div>
      <div className="font-display text-4xl font-black mt-1 tabular-nums">{String(value).padStart(2, '0')}</div>
    </div>
  );
}
