import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth, dashboardPathFor, formatApiErrorDetail } from '@/lib/auth';
import { ArrowRight } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('member');
  const [form, setForm] = useState({ name: '', email: '', password: '', student_id: '', department: '' });
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await register({ ...form, role });
      toast.success('Account created');
      navigate(dashboardPathFor(u.role));
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Registration failed');
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
      <div className="relative hidden lg:flex flex-col justify-between p-12 border-r border-white/10 ruler-grid">
        <Link to="/" data-testid="register-home-link" className="font-display font-black uppercase tracking-[0.3em] text-sm inline-flex items-center gap-3">
          <div className="w-8 h-8 border border-white/60 grid place-items-center text-[10px]">TMC</div>
          The Moment Club
        </Link>
        <div>
          <div className="font-mono text-xs tracking-[0.3em] uppercase opacity-70 mb-4">§ JOIN</div>
          <h1 className="font-display text-6xl font-black uppercase tracking-tighter leading-[0.85]">
            New here?<br/>Let's build<br/>something.
          </h1>
          <p className="text-white/60 mt-6 max-w-md font-light">
            Members get access to events & announcements. Faculty mentor proposals. Core Team runs the club.
          </p>
        </div>
        <div className="font-mono text-xs tracking-widest uppercase opacity-50">CU · SECTOR E-09 · 2026</div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="font-mono text-xs tracking-[0.3em] uppercase opacity-70 mb-3">CREATE ACCOUNT</div>
          <h2 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8">Register</h2>

          <div className="mb-6">
            <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mb-2">SELECT ROLE</div>
            <Tabs value={role} onValueChange={setRole}>
              <TabsList className="grid grid-cols-3 w-full bg-transparent p-0 h-auto gap-0 border border-white/20 rounded-none">
                <TabsTrigger data-testid="register-role-core" value="core_team" className="rounded-none font-display font-bold uppercase tracking-widest text-xs py-3 data-[state=active]:bg-white data-[state=active]:text-black border-r border-white/20">Core</TabsTrigger>
                <TabsTrigger data-testid="register-role-faculty" value="faculty" className="rounded-none font-display font-bold uppercase tracking-widest text-xs py-3 data-[state=active]:bg-white data-[state=active]:text-black border-r border-white/20">Faculty</TabsTrigger>
                <TabsTrigger data-testid="register-role-member" value="member" className="rounded-none font-display font-bold uppercase tracking-widest text-xs py-3 data-[state=active]:bg-white data-[state=active]:text-black">Member</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field label="FULL NAME" testid="register-name-input" value={form.name} onChange={v => update('name', v)} required />
            <Field label="EMAIL" testid="register-email-input" type="email" value={form.email} onChange={v => update('email', v)} required />
            <Field label="PASSWORD (MIN 6)" testid="register-password-input" type="password" value={form.password} onChange={v => update('password', v)} required />
            {role !== 'faculty' && (
              <Field label="STUDENT ID (OPTIONAL)" testid="register-studentid-input" value={form.student_id} onChange={v => update('student_id', v)} />
            )}
            <Field label={role === 'faculty' ? 'DEPARTMENT' : 'DEPARTMENT / BRANCH'} testid="register-department-input" value={form.department} onChange={v => update('department', v)} />

            {role === 'member' && (
              <div className="border border-white/15 p-3 text-xs font-mono tracking-wide opacity-80">
                NOTE: MEMBER ACCOUNTS REQUIRE APPROVAL FROM THE CORE TEAM BEFORE FULL ACCESS.
              </div>
            )}

            <button
              data-testid="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full btn-inv py-4 font-display font-bold uppercase tracking-widest text-sm inline-flex items-center justify-between px-6 disabled:opacity-50"
            >
              {loading ? 'CREATING…' : 'CREATE ACCOUNT'} <ArrowRight size={16} />
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-white/15 flex-1" />
            <div className="font-mono text-[10px] tracking-widest uppercase opacity-60">OR</div>
            <div className="h-px bg-white/15 flex-1" />
          </div>

          <button
            data-testid="register-google-btn"
            onClick={googleLogin}
            className="w-full btn-outline-w py-4 font-display font-bold uppercase tracking-widest text-sm inline-flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="currentColor"><path d="M44.5 20H24v8.5h11.8C34.7 33.4 30 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.2l6-6C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.1-2.7-.5-4z"/></svg>
            Continue with Google
          </button>

          <div className="mt-8 font-mono text-xs tracking-widest uppercase opacity-70">
            HAVE AN ACCOUNT?{' '}
            <Link to="/login" data-testid="register-login-link" className="underline underline-offset-4 text-white">SIGN IN →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', testid, required }) {
  return (
    <div>
      <label className="font-mono text-[10px] tracking-widest uppercase opacity-60 block mb-2">{label}</label>
      <input
        data-testid={testid}
        required={required}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-transparent border border-white/20 focus:border-white outline-none px-4 py-3 text-base"
      />
    </div>
  );
}
