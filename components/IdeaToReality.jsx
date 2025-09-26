'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Lightbulb, ClipboardList, Palette, Code2, ShieldCheck, Rocket } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STAGES = [
  { id: '01', title: 'Idea', desc: 'We validate your concept, audience, and feasibility.', Icon: Lightbulb },
  { id: '02', title: 'Plan', desc: 'Market research, niche strategy, roadmap, and pricing.', Icon: ClipboardList },
  { id: '03', title: 'Design', desc: 'Branding, UI/UX, content, and social presence setup.', Icon: Palette },
  { id: '04', title: 'Build', desc: 'Web/app, AI/ML, IoT, cloud, automations—built to scale.', Icon: Code2 },
  { id: '05', title: 'Test', desc: 'QA, security checks, performance and SEO hardening.', Icon: ShieldCheck },
  { id: '06', title: 'Launch', desc: 'Deploy, market, iterate—turn users into customers.', Icon: Rocket },
];

export default function IdeaToReality() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const connectorRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Stagger in each stage card as it scrolls into view
      gsap.from(cardsRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power2.out',
      });

      // Animate the glowing connector line
      if (connectorRef.current) {
        const totalWidth = connectorRef.current.scrollWidth;
        gsap.fromTo(
          connectorRef.current,
          { backgroundSize: '0% 100%' },
          {
            backgroundSize: '100% 100%',
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="idea-to-reality" ref={sectionRef} className="relative py-24 md:py-28 bg-black/60">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30"
             style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(168,85,247,.35), rgba(59,130,246,.15) 50%, transparent 70%)' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 md:mb-16">
          <span className="inline-block text-xs tracking-widest uppercase text-purple-300/80 mb-2">Process</span>
          <h2 className="text-3xl md:text-4xl font-extrabold">
            From <span className="gradient-text">Idea</span> to <span className="gradient-text">Reality</span>
          </h2>
          <p className="mt-4 text-gray-300 max-w-3xl mx-auto">
            Pay as you go. Add or remove services like add‑ons. No heavy upfronts—just momentum.
          </p>
        </div>

        {/* Connector line */}
        <div
          ref={connectorRef}
          className="hidden md:block h-[2px] w-full mb-10"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(147,51,234,.0) 0%, rgba(147,51,234,.6) 20%, rgba(59,130,246,.6) 50%, rgba(236,72,153,.6) 80%, rgba(236,72,153,0) 100%)',
            backgroundRepeat: 'no-repeat',
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {STAGES.map((stage, idx) => (
            <div
              key={stage.id}
              ref={(el) => (cardsRef.current[idx] = el)}
              className="group relative rounded-2xl border border-purple-500/10 bg-gradient-to-b from-slate-900/60 to-slate-900/20 p-6 md:p-7 glow-ring"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-xl bg-purple-500/10 text-purple-300 p-3 group-hover:neon-edge transition-shadow">
                  <stage.Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-purple-300/80">{stage.id}</div>
                  <h3 className="text-lg md:text-xl font-bold text-white">{stage.title}</h3>
                  <p className="mt-2 text-sm text-gray-300">{stage.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 md:mt-16">
          <a href="#contact" className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
            Start Today — Don’t Delay
          </a>
          <p className="mt-3 text-xs text-gray-400">“Small beginnings, limitless possibilities.”</p>
        </div>
      </div>
    </section>
  );
}


