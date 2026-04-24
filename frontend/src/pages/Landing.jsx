import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Marquee from 'react-fast-marquee';
import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar, MapPin, Users, Zap, Menu, X } from 'lucide-react';
import { useAuth, dashboardPathFor } from '@/lib/auth';
import { api } from '@/lib/api';

const HERO_IMG = 'https://static.prod-images.emergentagent.com/jobs/cb8b44b8-c919-4adb-aebd-9c5c55d5c593/images/a33438b75219f366bf7dcd8064e8d8c7fe5630e96ee52ab407618a15cd28b71a.png';
const LOGO = 'https://static.prod-images.emergentagent.com/jobs/cb8b44b8-c919-4adb-aebd-9c5c55d5c593/images/a8ae82c6f946840fc19e864acf0e87f3a984f6cf419f51591445569f3e1a2f0b.png';
const ABOUT_IMG = 'https://images.pexels.com/photos/5380607/pexels-photo-5380607.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';
const CAMPUS_IMG = 'https://images.unsplash.com/photo-1646059525996-3510c86159f8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB1bml2ZXJzaXR5JTIwYXJjaGl0ZWN0dXJlfGVufDB8fHxibGFja19hbmRfd2hpdGV8MTc3NjY3NTUzMnww&ixlib=rb-4.1.0&q=85';

const teamData = [
  { name: 'ARYAN KAPOOR', role: 'PRESIDENT · CSE 2026', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=500&fit=crop&auto=format&sat=-100' },
  { name: 'IRA SHARMA', role: 'VP · TECH · ECE 2026', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&auto=format&sat=-100' },
  { name: 'DEV MEHTA', role: 'HACKATHON LEAD · IT 2027', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&auto=format&sat=-100' },
  { name: 'DR. R. VERMA', role: 'FACULTY MENTOR', img: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=500&fit=crop&auto=format&sat=-100' },
];

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
    : ['WELCOME TO THE MOMENT CLUB', 'CHANDIGARH UNIVERSITY · TECH × HACKATHONS'];

  const goDash = () => user && navigate(dashboardPathFor(user.role));

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link to="/" data-testid="nav-logo" className="flex items-center gap-3">
            <div className="w-8 h-8 border border-white/60 grid place-items-center font-display font-black text-[10px]">TMC</div>
            <div className="font-display font-black uppercase tracking-[0.2em] text-sm hidden sm:block">The Moment Club</div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest uppercase">
            <a href="#about" className="link-underline" data-testid="nav-about">About</a>
            <a href="#events" className="link-underline" data-testid="nav-events">Events</a>
            <a href="#team" className="link-underline" data-testid="nav-team">Team</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <button onClick={goDash} data-testid="nav-dashboard-btn" className="btn-inv px-4 py-2 font-display font-bold uppercase text-xs tracking-widest">Dashboard</button>
            ) : (
              <>
                <Link to="/login" data-testid="nav-login-btn" className="btn-outline-w px-4 py-2 font-display font-bold uppercase text-xs tracking-widest hidden sm:inline-block">Sign In</Link>
                <Link to="/register" data-testid="nav-register-btn" className="btn-inv px-4 py-2 font-display font-bold uppercase text-xs tracking-widest">Join</Link>
              </>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              data-testid="nav-hamburger-btn"
              className="md:hidden ml-1 w-10 h-10 border border-white/20 grid place-items-center hover:bg-white hover:text-black transition-colors"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-black text-white md:hidden" data-testid="mobile-menu">
          <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-white/60 grid place-items-center font-display font-black text-[10px]">TMC</div>
              <div className="font-display font-black uppercase tracking-[0.2em] text-sm">The Moment Club</div>
            </div>
            <button onClick={() => setMenuOpen(false)} data-testid="mobile-menu-close" className="w-10 h-10 border border-white/20 grid place-items-center" aria-label="Close menu">
              <X size={18} />
            </button>
          </div>
          <nav className="p-6 flex flex-col gap-1">
            {[
              { href: '#about', label: 'ABOUT', testid: 'mobile-nav-about' },
              { href: '#events', label: 'EVENTS', testid: 'mobile-nav-events' },
              { href: '#team', label: 'TEAM', testid: 'mobile-nav-team' },
            ].map(i => (
              <a key={i.href} href={i.href} data-testid={i.testid} onClick={() => setMenuOpen(false)} className="py-5 border-b border-white/10 font-display text-4xl font-black uppercase tracking-tighter flex items-center justify-between">
                {i.label} <ArrowUpRight size={24} />
              </a>
            ))}
          </nav>
          <div className="p-6 grid grid-cols-2 gap-3">
            {user ? (
              <button onClick={() => { setMenuOpen(false); goDash(); }} data-testid="mobile-nav-dashboard" className="col-span-2 btn-inv py-4 font-display font-bold uppercase text-sm tracking-widest">Dashboard</button>
            ) : (
              <>
                <Link to="/login" data-testid="mobile-nav-login" onClick={() => setMenuOpen(false)} className="btn-outline-w py-4 font-display font-bold uppercase text-sm tracking-widest text-center">Sign In</Link>
                <Link to="/register" data-testid="mobile-nav-register" onClick={() => setMenuOpen(false)} className="btn-inv py-4 font-display font-bold uppercase text-sm tracking-widest text-center">Join</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* MARQUEE NOTIFICATION BAR */}
      <div className="fixed top-16 left-0 right-0 z-40 border-b border-white/10 bg-black" data-testid="notification-marquee">
        <Marquee speed={60} gradient={false} pauseOnHover>
          <div className="flex items-center gap-16 py-3 font-display font-bold uppercase tracking-wider text-sm">
            {marqueeItems.concat(marqueeItems).map((m, i) => (
              <div key={i} className="flex items-center gap-16">
                <span className="stroke-white-text text-xl">✦</span>
                <span className="whitespace-nowrap">{m}</span>
              </div>
            ))}
          </div>
        </Marquee>
      </div>

      {/* HERO */}
      <section className="relative min-h-screen pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover opacity-40 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        </div>
        <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="font-mono text-xs tracking-[0.3em] uppercase opacity-70 mb-6">CHANDIGARH UNIVERSITY · EST. 2020 · SECTOR E-09</div>
            <h1 className="font-display text-[12vw] md:text-[10vw] lg:text-[160px] leading-[0.85] font-black uppercase tracking-tighter">
              The Moment<br/>
              <span className="stroke-white-text">Is Now.</span>
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl">
              <p className="md:col-span-2 text-lg md:text-xl font-light leading-relaxed text-white/80">
                A collective of makers, hackers and builders at Chandigarh University. We ship ideas into existence — 48 hours at a time.
              </p>
              <div className="flex flex-col gap-3">
                <Link to="/register" data-testid="hero-join-btn" className="btn-inv px-8 py-4 font-display font-bold uppercase tracking-widest text-sm inline-flex items-center justify-between gap-2">
                  Become a Member <ArrowUpRight size={16} />
                </Link>
                <a href="#events" data-testid="hero-events-btn" className="btn-outline-w px-8 py-4 font-display font-bold uppercase tracking-widest text-sm inline-flex items-center justify-between gap-2">
                  See Events <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-px bg-white/10 mt-20 border border-white/10" data-testid="hero-stats">
            {[{ label: 'EVENTS HOSTED', v: stats.events }, { label: 'ACTIVE MEMBERS', v: stats.members }, { label: 'HACKATHONS', v: stats.hackathons }].map((s, i) => (
              <div key={i} className="bg-black p-8">
                <div className="font-mono text-xs tracking-widest opacity-60">{s.label}</div>
                <div className="font-display text-5xl md:text-7xl font-black mt-2 tabular-nums">{String(s.v).padStart(2, '0')}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT CLUB */}
      <section id="about" className="relative py-24 md:py-32 border-t border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="font-mono text-xs tracking-[0.3em] uppercase opacity-70 mb-4">§ 01 · ABOUT CLUB</div>
            <h2 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
              We Build.<br/>We Ship.<br/>We Repeat.
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 space-y-6">
            <p className="text-lg font-light leading-relaxed text-white/85">
              THE MOMENT CLUB is CU's flagship tech society — a place where engineering students prototype hard ideas with soft deadlines. We host hackathons, workshops, and tech talks with staff engineers from the industry.
            </p>
            <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10">
              {[
                { icon: Zap, t: 'HACKATHONS', d: 'Flagship 24–48 hour sprint events.' },
                { icon: Users, t: 'COMMUNITY', d: '500+ builders across branches.' },
                { icon: Calendar, t: 'WORKSHOPS', d: 'Hands-on deep dives every month.' },
                { icon: MapPin, t: 'INDUSTRY', d: 'Mentors from top product teams.' },
              ].map((f, i) => (
                <div key={i} className="bg-black p-6">
                  <f.icon size={18} className="mb-3" />
                  <div className="font-display font-bold uppercase text-sm tracking-widest">{f.t}</div>
                  <div className="text-sm text-white/70 mt-1">{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section id="events" className="relative py-24 md:py-32 border-t border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="font-mono text-xs tracking-[0.3em] uppercase opacity-70 mb-4">§ 02 · UPCOMING</div>
              <h2 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter">Events</h2>
            </div>
            <Link to={user ? dashboardPathFor(user.role) : '/login'} data-testid="events-viewall-btn" className="hidden md:inline-flex font-mono text-xs tracking-widest uppercase link-underline items-center gap-2">
              VIEW ALL <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10" data-testid="events-grid">
            {events.slice(0, 6).map((e, i) => (
              <motion.article
                key={e.event_id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-black group relative overflow-hidden"
                data-testid={`event-card-${i}`}
              >
                {e.image_url && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={e.image_url} alt={e.title} className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between font-mono text-[10px] tracking-widest uppercase opacity-70 mb-3">
                    <span>{e.category}</span>
                    <span>{e.date}</span>
                  </div>
                  <h3 className="font-display text-2xl font-black uppercase tracking-tight leading-tight">{e.title}</h3>
                  <p className="text-sm text-white/70 mt-2 line-clamp-2">{e.description}</p>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                    <span className="font-mono text-xs uppercase tracking-widest">{e.location}</span>
                    <ArrowUpRight size={18} className="group-hover:rotate-45 transition-transform duration-300" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT US / TEAM */}
      <section id="team" className="relative py-24 md:py-32 border-t border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            <div className="lg:col-span-5">
              <div className="font-mono text-xs tracking-[0.3em] uppercase opacity-70 mb-4">§ 03 · ABOUT US</div>
              <h2 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter">The Core.</h2>
            </div>
            <p className="lg:col-span-6 lg:col-start-7 text-lg font-light leading-relaxed text-white/85">
              We are students, dropouts, late-night debuggers, and first-prize losers. The people behind every poster, every pull request and every 4 AM coffee run.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {teamData.map((p, i) => (
              <div key={i} className="bg-black group" data-testid={`team-card-${i}`}>
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <div className="p-4">
                  <div className="font-display font-black uppercase tracking-tight">{p.name}</div>
                  <div className="font-mono text-[10px] tracking-widest uppercase opacity-70 mt-1">{p.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 border-t border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 items-center gap-8">
          <h3 className="md:col-span-7 font-display text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
            Ready to ship something?
          </h3>
          <div className="md:col-span-5 flex flex-col md:flex-row gap-3 md:justify-end">
            <Link to="/register" data-testid="cta-register-btn" className="btn-inv px-8 py-4 font-display font-bold uppercase tracking-widest text-sm">Register</Link>
            <Link to="/login" data-testid="cta-login-btn" className="btn-outline-w px-8 py-4 font-display font-bold uppercase tracking-widest text-sm">Sign In</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="font-mono text-xs tracking-widest uppercase opacity-60">© 2026 THE MOMENT CLUB · CHANDIGARH UNIVERSITY</div>
          <div className="font-mono text-xs tracking-widest uppercase opacity-60">MADE IN PUNJAB · BUILT FOR THE WORLD</div>
        </div>
      </footer>
    </div>
  );
}
