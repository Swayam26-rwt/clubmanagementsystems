import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { ArrowLeft, Trophy, Users, Calendar as CalIcon, MapPin } from 'lucide-react';

export default function PastEvents() {
  const [events, setEvents] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api.get('/events/past').then(r => setEvents(r.data)).catch(() => {});
  }, []);

  const totalParticipants = events.reduce((s, e) => s + (e.registered_count || 0), 0);
  const hackathons = events.filter(e => (e.category || '').toLowerCase().includes('hackathon')).length;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link to="/" data-testid="past-back-link" className="font-display font-black uppercase tracking-[0.2em] text-sm inline-flex items-center gap-3">
            <ArrowLeft size={14} /> BACK
          </Link>
          <div className="font-mono text-xs tracking-widest uppercase opacity-70">§ PAST EVENTS</div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative py-24 md:py-32 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="font-mono text-xs tracking-[0.3em] uppercase opacity-70 mb-6">THE MOMENT CLUB · ARCHIVE</div>
          <h1 className="font-display text-[12vw] md:text-[8vw] lg:text-[120px] leading-[0.9] font-black uppercase tracking-tighter">
            We built<br/><span className="stroke-white-text">a lot.</span>
          </h1>
          <div className="grid grid-cols-3 gap-px bg-white/10 mt-16 border border-white/10" data-testid="past-stats">
            {[
              { label: 'EVENTS HOSTED', v: events.length },
              { label: 'PARTICIPANTS', v: totalParticipants },
              { label: 'HACKATHONS', v: hackathons },
            ].map((s, i) => (
              <div key={i} className="bg-black p-6 md:p-8">
                <div className="font-mono text-xs tracking-widest opacity-60">{s.label}</div>
                <div className="font-display text-4xl md:text-6xl font-black mt-2 tabular-nums">{String(s.v).padStart(2, '0')}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS TIMELINE */}
      <section className="py-20">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 space-y-20">
          {events.map((e, i) => (
            <motion.article
              key={e.event_id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-white/10 pt-20"
              data-testid={`past-event-${e.event_id}`}
            >
              <div className="lg:col-span-5">
                <div className="font-mono text-xs tracking-[0.3em] uppercase opacity-60 mb-3">{e.category} · {e.date}</div>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9]">{e.title}</h2>
                <p className="text-white/75 mt-6 max-w-lg">{e.description}</p>
                <dl className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 mt-8">
                  <div className="bg-black p-4">
                    <dt className="font-mono text-[10px] tracking-widest uppercase opacity-60 inline-flex items-center gap-1"><Users size={10}/> PARTICIPANTS</dt>
                    <dd className="font-display text-2xl font-black tabular-nums mt-1">{String(e.registered_count || 0).padStart(3, '0')}</dd>
                  </div>
                  <div className="bg-black p-4">
                    <dt className="font-mono text-[10px] tracking-widest uppercase opacity-60 inline-flex items-center gap-1"><MapPin size={10}/> LOCATION</dt>
                    <dd className="font-display text-sm font-bold uppercase tracking-tight mt-1">{e.location}</dd>
                  </div>
                  {e.prize_pool && (
                    <div className="bg-black p-4 col-span-2">
                      <dt className="font-mono text-[10px] tracking-widest uppercase opacity-60 inline-flex items-center gap-1"><Trophy size={10}/> PRIZE POOL</dt>
                      <dd className="font-display text-2xl font-black uppercase tracking-tight mt-1">{e.prize_pool}</dd>
                    </div>
                  )}
                </dl>

                {e.winners?.length > 0 && (
                  <div className="mt-8">
                    <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mb-3 inline-flex items-center gap-2"><Trophy size={10}/> WINNERS</div>
                    <ol className="space-y-2">
                      {e.winners.map((w, wi) => (
                        <li key={wi} className="flex items-start gap-4 border-t border-white/10 pt-3">
                          <span className="font-display font-black tabular-nums text-2xl opacity-40">{String(wi + 1).padStart(2, '0')}</span>
                          <span className="font-display font-bold uppercase tracking-tight">{w}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              <div className="lg:col-span-7 lg:col-start-6">
                {e.image_url && (
                  <div className="aspect-[16/10] overflow-hidden border border-white/10 mb-3">
                    <img src={e.image_url} alt={e.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                  </div>
                )}
                {e.photos?.length > 0 && (
                  <div className="grid grid-cols-3 gap-3" data-testid={`past-photos-${e.event_id}`}>
                    {e.photos.map((url, pi) => (
                      <button
                        key={pi}
                        onClick={() => setActive(url)}
                        data-testid={`past-photo-${e.event_id}-${pi}`}
                        className="aspect-square overflow-hidden border border-white/10 group"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.article>
          ))}

          {events.length === 0 && (
            <div className="text-center py-40 font-mono text-xs tracking-widest uppercase opacity-60" data-testid="past-empty">
              NO PAST EVENTS YET. CHECK BACK SOON.
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 py-20">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <h3 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] max-w-xl">
            Want the next one to include you?
          </h3>
          <div className="flex gap-3">
            <Link to="/register" data-testid="past-cta-register" className="btn-inv px-6 py-3 font-display font-bold uppercase tracking-widest text-xs">JOIN THE CLUB</Link>
            <Link to="/" data-testid="past-cta-home" className="btn-outline-w px-6 py-3 font-display font-bold uppercase tracking-widest text-xs">UPCOMING EVENTS</Link>
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      {active && (
        <div className="fixed inset-0 z-50 bg-black/95 grid place-items-center p-6" onClick={() => setActive(null)} data-testid="past-lightbox">
          <img src={active} alt="" className="max-w-full max-h-full object-contain border border-white/20" />
        </div>
      )}
    </div>
  );
}
