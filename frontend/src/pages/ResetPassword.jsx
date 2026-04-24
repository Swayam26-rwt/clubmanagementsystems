import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import { formatApiErrorDetail } from '@/lib/auth';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Missing reset token');
    }
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset · please sign in');
      navigate('/login');
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
          <div className="font-mono text-xs tracking-[0.3em] uppercase opacity-70 mb-4">§ NEW KEY</div>
          <h1 className="font-display text-6xl font-black uppercase tracking-tighter leading-[0.85]">
            Set a new<br/>password.
          </h1>
          <p className="text-white/60 mt-6 max-w-md font-light">
            Choose a strong password — at least 6 characters. You'll be signed out from all sessions.
          </p>
        </div>
        <div className="font-mono text-xs tracking-widest uppercase opacity-50">CU · SECTOR E-09 · 2026</div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="font-mono text-xs tracking-[0.3em] uppercase opacity-70 mb-3">RESET PASSWORD</div>
          <h2 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8">New Password</h2>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="font-mono text-[10px] tracking-widest uppercase opacity-60 block mb-2">NEW PASSWORD (MIN 6)</label>
              <input
                data-testid="reset-password-input"
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-transparent border border-white/20 focus:border-white outline-none px-4 py-3 text-base"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest uppercase opacity-60 block mb-2">CONFIRM PASSWORD</label>
              <input
                data-testid="reset-confirm-input"
                required
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full bg-transparent border border-white/20 focus:border-white outline-none px-4 py-3 text-base"
              />
            </div>
            <button
              data-testid="reset-submit-btn"
              type="submit"
              disabled={loading || !token}
              className="w-full btn-inv py-4 font-display font-bold uppercase tracking-widest text-sm inline-flex items-center justify-between px-6 disabled:opacity-50"
            >
              {loading ? 'UPDATING…' : 'UPDATE PASSWORD'} <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-8 font-mono text-xs tracking-widest uppercase opacity-70">
            <Link to="/login" data-testid="reset-login-link" className="underline underline-offset-4 text-white">← BACK TO SIGN IN</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
