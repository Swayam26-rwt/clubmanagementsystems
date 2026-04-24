import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth, dashboardPathFor, formatApiErrorDetail } from '@/lib/auth';
import { ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('member');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      if (u.role !== role) {
        toast.warning(`Logged in as ${u.role.replace('_', ' ')}`);
      }
      navigate(dashboardPathFor(u.role));
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard/member';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-black text-white grid grid-cols-1 lg:grid-cols-2">
      {/* Left */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 border-r border-white/10 overflow-hidden ruler-grid">
        <Link to="/" data-testid="login-home-link" className="font-display font-black uppercase tracking-[0.3em] text-sm inline-flex items-center gap-3">
          <div className="w-8 h-8 border border-white/60 grid place-items-center text-[10px]">TMC</div>
          The Moment Club
        </Link>
        <div>
          <div className="font-mono text-xs tracking-[0.3em] uppercase opacity-70 mb-4">§ RETURN</div>
          <h1 className="font-display text-6xl font-black uppercase tracking-tighter leading-[0.85]">
            Sign in<br/>to continue<br/>building.
          </h1>
          <p className="text-white/60 mt-6 max-w-md font-light">
            Chandigarh University's tech society. Every account unlocks a different view of the club.
          </p>
        </div>
        <div className="font-mono text-xs tracking-widest uppercase opacity-50">CU · SECTOR E-09 · 2026</div>
      </div>

      {/* Right */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="font-mono text-xs tracking-[0.3em] uppercase opacity-70 mb-3">AUTHENTICATION</div>
          <h2 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8">Sign In</h2>

          <div className="mb-6">
            <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mb-2">SELECT ROLE</div>
            <Tabs value={role} onValueChange={setRole}>
              <TabsList className="grid grid-cols-3 w-full bg-transparent p-0 h-auto gap-0 border border-white/20 rounded-none">
                <TabsTrigger data-testid="login-role-core" value="core_team" className="rounded-none font-display font-bold uppercase tracking-widest text-xs py-3 data-[state=active]:bg-white data-[state=active]:text-black border-r border-white/20">Core</TabsTrigger>
                <TabsTrigger data-testid="login-role-faculty" value="faculty" className="rounded-none font-display font-bold uppercase tracking-widest text-xs py-3 data-[state=active]:bg-white data-[state=active]:text-black border-r border-white/20">Faculty</TabsTrigger>
                <TabsTrigger data-testid="login-role-member" value="member" className="rounded-none font-display font-bold uppercase tracking-widest text-xs py-3 data-[state=active]:bg-white data-[state=active]:text-black">Member</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="font-mono text-[10px] tracking-widest uppercase opacity-60 block mb-2">EMAIL</label>
              <input
                data-testid="login-email-input"
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-transparent border border-white/20 focus:border-white outline-none px-4 py-3 text-base"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-widest uppercase opacity-60 block mb-2">PASSWORD</label>
              <input
                data-testid="login-password-input"
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-transparent border border-white/20 focus:border-white outline-none px-4 py-3 text-base"
              />
            </div>
            <button
              data-testid="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full btn-inv py-4 font-display font-bold uppercase tracking-widest text-sm inline-flex items-center justify-between px-6 disabled:opacity-50"
            >
              {loading ? 'SIGNING IN…' : 'SIGN IN'} <ArrowRight size={16} />
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-white/15 flex-1" />
            <div className="font-mono text-[10px] tracking-widest uppercase opacity-60">OR</div>
            <div className="h-px bg-white/15 flex-1" />
          </div>

          <button
            data-testid="login-google-btn"
            onClick={googleLogin}
            className="w-full btn-outline-w py-4 font-display font-bold uppercase tracking-widest text-sm inline-flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="currentColor"><path d="M44.5 20H24v8.5h11.8C34.7 33.4 30 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.2l6-6C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.1-2.7-.5-4z"/></svg>
            Continue with Google
          </button>

          <div className="mt-8 font-mono text-xs tracking-widest uppercase opacity-70">
            <Link to="/forgot-password" data-testid="login-forgot-link" className="underline underline-offset-4 text-white/80">FORGOT PASSWORD?</Link>
            <span className="mx-2 opacity-40">·</span>
            NEW HERE?{' '}
            <Link to="/register" data-testid="login-register-link" className="underline underline-offset-4 text-white">REGISTER →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
