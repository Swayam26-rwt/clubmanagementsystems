import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import { formatApiErrorDetail } from '@/lib/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-12 border-r border-white/10 ruler-grid">
        <Link to="/" className="font-display font-black uppercase tracking-[0.3em] text-sm inline-flex items-center gap-3">
          <div className="w-8 h-8 border border-white/60 grid place-items-center text-[10px]">TMC</div>
          The Moment Club
        </Link>
        <div>
          <div className="font-mono text-xs tracking-[0.3em] uppercase opacity-70 mb-4">§ RECOVER</div>
          <h1 className="font-display text-6xl font-black uppercase tracking-tighter leading-[0.85]">
            Forgot<br/>your<br/>password?
          </h1>
          <p className="text-white/60 mt-6 max-w-md font-light">
            Enter your account email — we'll send a one-time reset link valid for 1 hour.
          </p>
        </div>
        <div className="font-mono text-xs tracking-widest uppercase opacity-50">CU · SECTOR E-09 · 2026</div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="font-mono text-xs tracking-[0.3em] uppercase opacity-70 mb-3">RESET PASSWORD</div>
          <h2 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8">Forgot Password</h2>

          {sent ? (
            <div className="border border-white/20 p-6 space-y-4" data-testid="forgot-sent-msg">
              <div className="font-display font-bold uppercase tracking-widest">CHECK YOUR INBOX</div>
              <p className="text-sm text-white/70">
                If an account exists for <span className="font-mono">{email}</span>, we've sent a password reset link. It expires in 1 hour.
              </p>
              <Link to="/login" data-testid="forgot-back-login" className="inline-block btn-outline-w px-5 py-2.5 font-display font-bold uppercase tracking-widest text-xs">BACK TO SIGN IN</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="font-mono text-[10px] tracking-widest uppercase opacity-60 block mb-2">EMAIL</label>
                <input
                  data-testid="forgot-email-input"
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-white/20 focus:border-white outline-none px-4 py-3 text-base"
                />
              </div>
              <button
                data-testid="forgot-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full btn-inv py-4 font-display font-bold uppercase tracking-widest text-sm inline-flex items-center justify-between px-6 disabled:opacity-50"
              >
                {loading ? 'SENDING…' : 'SEND RESET LINK'} <ArrowRight size={16} />
              </button>
            </form>
          )}

          <div className="mt-8 font-mono text-xs tracking-widest uppercase opacity-70">
            REMEMBERED?{' '}
            <Link to="/login" data-testid="forgot-login-link" className="underline underline-offset-4 text-white">SIGN IN →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
