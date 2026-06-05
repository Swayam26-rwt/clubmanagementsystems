import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Marquee from 'react-fast-marquee';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MapPin, Users, Zap, Menu, X, Sparkles, Trophy, ChevronRight } from 'lucide-react';
import { useAuth, dashboardPathFor } from '@/lib/auth';
import { api } from '@/lib/api';

const HERO_IMG = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80';

const teamData = [
  { name: 'Aryan Kapoor', role: 'President · CSE 2026', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=500&fit=crop&auto=format', gradient: 'from-violet-500 to-indigo-600' },
  { name: 'Ira Sharma', role: 'VP Tech · ECE 2026', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&auto=format', gradient: 'from-rose-500 to-pink-600' },
  { name: 'Dev Mehta', role: 'Hackathon Lead · IT 2027', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&auto=format', gradient: 'from-cyan-500 to-blue-600' },
  { name: 'Dr. R. Verma', role: 'Faculty Mentor', img: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=500&fit=crop&auto=format', gradient: 'from-amber-500 to-orange-600' },
];

const CATEGORY_COLORS = {
  Hackathon: 'badge-violet',
  Workshop:  'badge-cyan',
  Conference:'badge-amber',
  'Tech Talk':'badge-green',
  Summit:    'badge-rose',
};

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ events: 0, members: 0, hackathons: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.get('/notifications').then(r => setNotifications(r.data)).catch(() => {});
    api.get('/events').then(r => setEvents(r.data)).catch(() => {});
    api.get('/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const marqueeItems = notifications.length
    ? notifications.map(n => n.message)
    : ['WELCOME TO THE MOMENT CLUB ✦', 'CHANDIGARH UNIVERSITY · TECH × HACKATHONS ✦', 'NEXT HACKATHON · HACKNITE 2026 ✦'];

  const goDash = () => user && navigate(dashboardPathFor(user.role));

  return (
    <div className="min-h-screen bg-grad-hero text-white overflow-x-hidden">

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Notification marquee */}
        <div className="bg-violet-600/90 backdrop-blur-md text-white text-xs font-semibold py-1.5 overflow-hidden" data-testid="notification-marquee">
          <Marquee speed={55} gradient={false} pauseOnHover>
            <div className="flex items-center gap-12 px-8">
              {marqueeItems.concat(marqueeItems).map((m, i) => (
                <span key={i} className="whitespace-nowrap tracking-wide">{m}</span>
              ))}
            </div>
          </Marquee>
        </div>
        {/* Nav */}
        <nav className="glass-strong mx-3 mt-2 px-5 h-14 flex items-center justify-between rounded-2xl shadow-xl">
          <Link to="/" data-testid="nav-logo" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center shadow-lg">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight">The Moment Club</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
            <a href="#about" className="hover:text-white transition-colors" data-testid="nav-about">About</a>
            <a href="#events" className="hover:text-white transition-colors" data-testid="nav-events">Events</a>
            <Link to="/past-events" className="hover:text-white transition-colors" data-testid="nav-past">Archive</Link>
            <a href="#team" className="hover:text-white transition-colors" data-testid="nav-team">Team</a>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <button onClick={goDash} data-testid="nav-dashboard-btn" className="btn-primary text-xs px-4 py-2">
                Dashboard <ArrowRight size={13} />
              </button>
            ) : (
              <>
                <Link to="/login" data-testid="nav-login-btn" className="btn-ghost text-xs px-4 py-2 hidden sm:inline-flex">Sign In</Link>
                <Link to="/register" data-testid="nav-register-btn" className="btn-primary text-xs px-4 py-2">Join Now</Link>
              </>
            )}
            <button onClick={() => setMenuOpen(true)} data-testid="nav-hamburger-btn" className="md:hidden btn-ghost p-2" aria-label="Open menu">
              <Menu size={18} />
            </button>
          </div>
        </nav>
      </header>

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[60] glass-strong md:hidden flex flex-col" data-testid="mobile-menu">
          <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center">
                <Sparkles size={15} />
              </div>
              <span className="font-display font-bold text-sm">The Moment Club</span>
            </div>
            <button onClick={() => setMenuOpen(false)} data-testid="mobile-menu-close" className="btn-ghost p-2"><X size={18} /></button>
          </div>
          <nav className="p-6 flex flex-col gap-2">
            {[
              { href: '#about',  label: 'About',   testid: 'mobile-nav-about' },
              { href: '#events', label: 'Events',  testid: 'mobile-nav-events' },
              { href: '#team',   label: 'Team',    testid: 'mobile-nav-team' },
            ].map(i => (
              <a key={i.href} href={i.href} data-testid={i.testid}
                onClick={() => setMenuOpen(false)}
                className="py-4 border-b border-white/10 font-display font-bold text-2xl flex items-center justify-between hover:text-violet-400 transition-colors">
                {i.label} <ChevronRight size={20} className="opacity-40" />
              </a>
            ))}
          </nav>
          <div className="p-6 grid grid-cols-2 gap-3 mt-auto">
            {user ? (
              <button onClick={() => { setMenuOpen(false); goDash(); }} data-testid="mobile-nav-dashboard" className="col-span-2 btn-primary py-3">Dashboard</button>
            ) : (
              <>
                <Link to="/login" data-testid="mobile-nav-login" onClick={() => setMenuOpen(false)} className="btn-ghost py-3 text-center text-sm">Sign In</Link>
                <Link to="/register" data-testid="mobile-nav-register" onClick={() => setMenuOpen(false)} className="btn-primary py-3 text-center text-sm">Join Now</Link>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 mesh-bg overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-rose-500/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 badge badge-violet mb-6">
              <Sparkles size={12} /> Chandigarh University · Est. 2020
            </div>
            <h1 className="font-display font-bold text-[clamp(3rem,8vw,6rem)] leading-[0.9] tracking-tight mb-6">
              Build Bold.<br />
              <span className="grad-text">Ship Fast.</span><br />
              Win Big.
            </h1>
            <p className="text-lg text-white/65 max-w-xl leading-relaxed mb-10">
              CU's flagship tech society — a collective of makers, hackers and builders. We host hackathons, workshops, and tech talks with engineers from India's top product companies.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" data-testid="hero-join-btn" className="btn-primary px-7 py-3 text-sm">
                Become a Member <ArrowRight size={15} />
              </Link>
              <a href="#events" data-testid="hero-events-btn" className="btn-secondary px-7 py-3 text-sm">
                Explore Events
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-14" data-testid="hero-stats">
              {[
                { label: 'Events Hosted', value: stats.events },
                { label: 'Active Members', value: stats.members },
                { label: 'Hackathons', value: stats.hackathons },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  className="glass p-4 text-center hover-lift">
                  <div className="stat-num">{String(s.value).padStart(2, '0')}</div>
                  <div className="text-xs text-white/50 mt-1 font-medium">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero image */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl glow-ring float-anim">
              <img src={HERO_IMG} alt="Club activity" className="w-full h-[520px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f1a]/80 via-transparent to-transparent" />
              {/* Floating card */}
              <div className="absolute bottom-6 left-6 right-6 glass p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center shrink-0">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">HACKNITE 2025</div>
                    <div className="text-xs text-white/60">280 builders · ₹2.5L prize pool</div>
                  </div>
                  <span className="badge badge-green ml-auto">Past</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-28 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 badge badge-cyan mb-5">§ 01 · About Club</div>
              <h2 className="font-display font-bold text-5xl md:text-6xl tracking-tight mb-6 leading-tight">
                We Build.<br />We <span className="grad-text-warm">Ship.</span><br />We Repeat.
              </h2>
              <p className="text-white/65 text-lg leading-relaxed mb-8">
                THE MOMENT CLUB is CU's premier tech society — where engineering students prototype hard ideas with soft deadlines. Join hackathons, workshops, and network with staff engineers from the industry.
              </p>
              <Link to="/register" className="btn-primary px-7 py-3 text-sm">Join the Club <ArrowRight size={15} /></Link>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Zap, t: 'Hackathons', d: 'Flagship 24–48hr sprint events with real prize pools.', color: 'from-violet-500 to-indigo-500', badge: 'badge-violet' },
                { icon: Users, t: 'Community', d: '500+ builders across all branches at CU.', color: 'from-cyan-500 to-blue-500', badge: 'badge-cyan' },
                { icon: Calendar, t: 'Workshops', d: 'Hands-on deep dives every month with experts.', color: 'from-emerald-500 to-teal-500', badge: 'badge-green' },
                { icon: MapPin, t: 'Industry', d: 'Mentors from Razorpay, Zerodha, Swiggy & more.', color: 'from-rose-500 to-pink-500', badge: 'badge-rose' },
              ].map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="glass p-5 hover-lift cursor-default">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} grid place-items-center mb-3 shadow-lg`}>
                    <f.icon size={18} className="text-white" />
                  </div>
                  <div className="font-display font-bold text-base mb-1">{f.t}</div>
                  <div className="text-sm text-white/55 leading-relaxed">{f.d}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section id="events" className="py-28 relative">
        <div className="absolute inset-0 mesh-bg opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 badge badge-amber mb-4">§ 02 · Upcoming</div>
              <h2 className="font-display font-bold text-5xl md:text-6xl tracking-tight">Events</h2>
            </div>
            <Link to={user ? dashboardPathFor(user.role) : '/login'} data-testid="events-viewall-btn"
              className="btn-secondary text-xs hidden md:inline-flex">View All <ArrowRight size={13} /></Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="events-grid">
            {events.slice(0, 6).map((e, i) => (
              <motion.article key={e.event_id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="glass hover-lift overflow-hidden group cursor-pointer" data-testid={`event-card-${i}`}>
                {e.image_url && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={e.image_url} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`badge ${CATEGORY_COLORS[e.category] || 'badge-gray'}`}>{e.category}</span>
                    <span className="text-xs text-white/50 font-mono">{e.date}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg leading-tight mb-2">{e.title}</h3>
                  <p className="text-sm text-white/55 line-clamp-2 mb-4">{e.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <MapPin size={12} /> {e.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <Users size={12} /> {e.registered_count || 0} registered
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
            {events.length === 0 && (
              <div className="col-span-full glass p-16 text-center text-white/40">No upcoming events yet. Check back soon!</div>
            )}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section id="team" className="py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 badge badge-rose mb-5">§ 03 · Core Team</div>
            <h2 className="font-display font-bold text-5xl md:text-6xl tracking-tight">The People<br />Behind It All</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {teamData.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass overflow-hidden hover-lift group" data-testid={`team-card-${i}`}>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${p.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
                </div>
                <div className="p-4">
                  <div className="font-display font-bold text-sm">{p.name}</div>
                  <div className="text-xs text-white/50 mt-1">{p.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/15 rounded-full blur-[120px]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display font-bold text-5xl md:text-6xl tracking-tight mb-6">
              Ready to ship<br /><span className="grad-text">something real?</span>
            </h2>
            <p className="text-white/60 text-lg mb-10">Join 500+ builders at Chandigarh University's premier tech club.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/register" data-testid="cta-register-btn" className="btn-primary px-8 py-3.5 text-sm">
                Register Now <ArrowRight size={15} />
              </Link>
              <Link to="/login" data-testid="cta-login-btn" className="btn-ghost px-8 py-3.5 text-sm">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center">
              <Sparkles size={13} />
            </div>
            <span className="font-display font-semibold text-sm">The Moment Club</span>
          </div>
          <div className="text-xs text-white/40">© 2026 The Moment Club · Chandigarh University</div>
          <div className="text-xs text-white/40">Made in Punjab · Built for the World</div>
        </div>
      </footer>
    </div>
  );
}
