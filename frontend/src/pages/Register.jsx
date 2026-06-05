import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth, dashboardPathFor, formatApiErrorDetail } from '@/lib/auth';
import { ArrowRight, Sparkles, Eye, EyeOff, Mail, Lock, User, Hash, BookOpen } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('member');
  const [form, setForm] = useState({ name: '', email: '', password: '', student_id: '', department: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await register({ ...form, role });
      toast.success('Account created! Welcome 🎉');
      navigate(dashboardPathFor(u.role));
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'core_team', label: 'Core Team', desc: 'Admin access', color: 'from-violet-500 to-indigo-600' },
    { id: 'faculty',   label: 'Faculty',   desc: 'Mentor access', color: 'from-cyan-500 to-blue-600' },
    { id: 'member',    label: 'Member',    desc: 'Needs approval', color: 'from-rose-500 to-pink-600' },
  ];

  return (
    <div className="min-h-screen bg-grad-hero flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-14">
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-rose-600/12 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px]" />

        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center shadow-lg">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-base">The Moment Club</span>
        </Link>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 badge badge-rose mb-6">§ Join</div>
          <h1 className="font-display font-bold text-[5rem] leading-[0.85] tracking-tight mb-6">
            New here?<br />Let's build<br /><span className="grad-text-warm">something.</span>
          </h1>
          <p className="text-white/50 text-lg max-w-sm leading-relaxed">
            Members get events & announcements. Faculty mentor proposals. Core Team runs the club.
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/30 font-mono">
          CU · Sector E-09 · 2026
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8 fade-up">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center">
              <Sparkles size={15} />
            </div>
            <span className="font-display font-bold text-sm">The Moment Club</span>
          </Link>

          <div className="mb-7">
            <h2 className="font-display font-bold text-4xl tracking-tight mb-1">Create account</h2>
            <p className="text-white/50 text-sm">Join Chandigarh University's tech club</p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-widest block mb-2">I am a…</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(r => (
                <button key={r.id} data-testid={`register-role-${r.id.split('_')[0]}`}
                  type="button" onClick={() => setRole(r.id)}
                  className={`py-2.5 px-2 rounded-lg text-xs font-semibold font-display tracking-wide transition-all duration-200 text-center
                    ${role === r.id
                      ? `bg-gradient-to-br ${r.color} text-white shadow-lg scale-[1.02]`
                      : 'glass text-white/50 hover:text-white'}`}>
                  <div>{r.label}</div>
                  <div className={`text-[10px] mt-0.5 font-normal ${role === r.id ? 'text-white/70' : 'text-white/30'}`}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            <InputField icon={User} label="Full Name" testid="register-name-input"
              value={form.name} onChange={v => update('name', v)} placeholder="Your full name" required />

            <InputField icon={Mail} label="Email" testid="register-email-input" type="email"
              value={form.email} onChange={v => update('email', v)} placeholder="you@university.edu" required />

            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest block mb-2">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input data-testid="register-password-input" required type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={e => update('password', e.target.value)}
                  placeholder="Min. 6 characters" className="inp pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {role !== 'faculty' && (
              <InputField icon={Hash} label="Student ID (optional)" testid="register-studentid-input"
                value={form.student_id} onChange={v => update('student_id', v)} placeholder="e.g. 23BAI10001" />
            )}

            <InputField icon={BookOpen} label={role === 'faculty' ? 'Department' : 'Department / Branch'}
              testid="register-department-input"
              value={form.department} onChange={v => update('department', v)} placeholder="e.g. Computer Science" />

            {role === 'member' && (
              <div className="glass p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <p className="text-xs text-amber-400/90 leading-relaxed">
                  ⚠️ Member accounts require approval from the Core Team before you get full access.
                </p>
              </div>
            )}

            <button data-testid="register-submit-btn" type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-sm mt-1">
              {loading ? 'Creating account…' : 'Create Account'} <ArrowRight size={15} />
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account?{' '}
            <Link to="/login" data-testid="register-login-link" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function InputField({ icon: Icon, label, testid, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div>
      <label className="text-xs font-semibold text-white/50 uppercase tracking-widest block mb-2">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input data-testid={testid} required={required} type={type} value={value}
          onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="inp pl-10" />
      </div>
    </div>
  );
}
