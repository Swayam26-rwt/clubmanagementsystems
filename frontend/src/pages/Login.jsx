import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth, dashboardPathFor, formatApiErrorDetail } from '@/lib/auth';
import { ArrowRight, Sparkles, Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('member');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      if (u.role !== role) toast.warning(`Logged in as ${u.role.replace('_', ' ')}`);
      navigate(dashboardPathFor(u.role));
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'core_team', label: 'Core Team', color: 'from-violet-500 to-indigo-600' },
    { id: 'faculty',   label: 'Faculty',   color: 'from-cyan-500 to-blue-600' },
    { id: 'member',    label: 'Member',    color: 'from-rose-500 to-pink-600' },
  ];

  return (
    <div className="min-h-screen bg-grad-hero flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-14">
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px]" />

        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center shadow-lg">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-base">The Moment Club</span>
        </Link>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 badge badge-violet mb-6">§ Return</div>
          <h1 className="font-display font-bold text-[5rem] leading-[0.85] tracking-tight mb-6">
            Sign in<br />to keep<br /><span className="grad-text">building.</span>
          </h1>
          <p className="text-white/50 text-lg max-w-sm leading-relaxed">
            Chandigarh University's tech society. Every role unlocks a unique view of the club.
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/30 font-mono">
          CU · Sector E-09 · 2026
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md fade-up">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center">
              <Sparkles size={15} />
            </div>
            <span className="font-display font-bold text-sm">The Moment Club</span>
          </Link>

          <div className="mb-8">
            <h2 className="font-display font-bold text-4xl tracking-tight mb-1">Welcome back</h2>
            <p className="text-white/50 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-widest block mb-2">Select Role</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(r => (
                <button key={r.id} data-testid={`login-role-${r.id.split('_')[0]}`}
                  type="button" onClick={() => setRole(r.id)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold font-display tracking-wide transition-all duration-200
                    ${role === r.id
                      ? `bg-gradient-to-br ${r.color} text-white shadow-lg scale-[1.02]`
                      : 'glass text-white/50 hover:text-white hover:bg-white/5'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest block mb-2">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  data-testid="login-email-input"
                  required type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="inp pl-10" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest block mb-2">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  data-testid="login-password-input"
                  required type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="inp pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" data-testid="login-forgot-link"
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button data-testid="login-submit-btn" type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-sm mt-2">
              {loading ? 'Signing in…' : 'Sign In'} <ArrowRight size={15} />
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            New here?{' '}
            <Link to="/register" data-testid="login-register-link" className="text-violet-400 hover:text-violet-300 transition-colors font-semibold">
              Create an account →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
