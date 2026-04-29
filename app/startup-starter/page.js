"use client"
import { useState, useEffect, useRef } from 'react';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function FadeIn({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`
    }}>
      {children}
    </div>
  );
}

const departments = [
  'Aeronautical Engineering',
  'Automobile Engineering',
  'Biomedical Engineering',
  'Biotechnology',
  'Chemical Engineering',
  'Civil Engineering',
  'Computer Science & Engineering',
  'Computer Science & Engineering (Cyber Security)',
  'Computer Science & Business Systems',
  'Computer Science & Design',
  'Electrical & Electronics Engineering',
  'Electronics & Communication Engineering',
  'Food Technology',
  'Information Technology',
  'Artificial Intelligence & Machine Learning',
  'Artificial Intelligence & Data Science',
  'Mechanical Engineering',
  'Mechatronics Engineering',
  'Robotics & Automation',
  'Humanities & Sciences',
  'Management Studies',
  'Other'
];

export default function App() {
  const [formData, setFormData] = useState({ name:'', email:'', rollNo:'', department:'', phoneNo:'', college:'REC' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();now 
    setLoading(true); setMessage(''); setShowResend(false);
    try {
      const res = await fetch('/api/startup-starter/register', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setMsgType('success');
        setMessage("You're in! Check your email for your QR ticket. Redirecting to WhatsApp group...");
        setFormData({ name:'', email:'', rollNo:'', department:'', phoneNo:'', college:'REC' });
        // Redirect to WhatsApp group after 2 seconds
        if (data.whatsappGroupUrl) {
          setTimeout(() => {
            window.open(data.whatsappGroupUrl, '_blank');
          }, 2000);
        }
      } else {
        setMsgType('error');
        if (data.alreadyRegistered) {
          setMessage("Already registered. Didn't get your ticket?");
          setShowResend(true); setResendEmail(formData.email);
        } else {
          setMessage(data.error || 'Something went wrong.');
        }
      }
    } catch { setMsgType('error'); setMessage('Network error. Try again.'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setLoading(true); setMessage('');
    try {
      const res = await fetch('/api/startup-starter/resend-email', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email: resendEmail })
      });
      const data = await res.json();
      if (res.ok) { 
        setMsgType('success'); 
        setMessage('Ticket resent. Check your inbox. Redirecting to WhatsApp group...'); 
        setShowResend(false);
        // Redirect to WhatsApp group after 2 seconds
        setTimeout(() => {
          window.open('https://chat.whatsapp.com/Fr8RQtkjnGyGKovtqiVX68', '_blank');
        }, 2000);
      }
      else { setMsgType('error'); setMessage(data.error || 'Failed to resend.'); }
    } catch { setMsgType('error'); setMessage('Network error. Try again.'); }
    finally { setLoading(false); }
  };

  const builds = [
    ['🎯','Problem','Validated with real data'],
    ['💡','Solution','Practical & scalable'],
    ['🚀','MVP','Tangible demo, day one'],
    ['📊','Pitch Deck','Investor-ready slides'],
    ['🏢','Brand','Name, logo, tagline'],
    ['👥','Team','Roles & structure'],
    ['💰','Revenue','Business model'],
    ['🎤','Live Pitch','Shark Tank format'],
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#09090b', color: '#fafafa', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '20px 40px',
        background: scrollY > 60 ? 'rgba(9,9,11,0.92)' : 'transparent',
        backdropFilter: scrollY > 60 ? 'blur(16px)' : 'none',
        transition: 'background 0.4s, backdrop-filter 0.4s',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: scrollY > 60 ? '1px solid rgba(255,255,255,0.06)' : 'none'
      }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Startup<span style={{ color: '#f97316' }}>Starter</span>
        </span>
        <span style={{
          background: 'rgba(249,115,22,0.15)', color: 'rgba(249,115,22,0.6)', padding: '10px 22px',
          borderRadius: 6, fontSize: 13, fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase', border: '1px solid rgba(249,115,22,0.2)'
        }}>Registration Closed</span>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '0 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
          top: '10%', right: '-5%', pointerEvents: 'none',
          transform: `translateY(${scrollY * 0.15}px)`
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)',
          bottom: '5%', left: '-5%', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 960, marginTop: 80 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            border: '1px solid rgba(249,115,22,0.3)', borderRadius: 40,
            padding: '6px 16px', marginBottom: 40,
            fontSize: 12, fontWeight: 500, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase',
            animation: 'fadeUp 0.6s ease both'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            April 28, 2026 · REC Campus
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(52px, 8vw, 108px)',
            fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em',
            margin: '0 0 24px',
            animation: 'fadeUp 0.7s 0.1s ease both'
          }}>
            Don't learn<br />
            <em style={{ color: '#f97316', fontStyle: 'italic' }}>startup.</em><br />
            Build one.
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(255,255,255,0.5)',
            maxWidth: 520, lineHeight: 1.6, marginBottom: 48,
            fontWeight: 300,
            animation: 'fadeUp 0.7s 0.2s ease both'
          }}>
            An 8-hour hands-on bootcamp where you go from idea to MVP — with a real pitch deck, business model, and live demo to show for it.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', animation: 'fadeUp 0.7s 0.3s ease both' }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(249,115,22,0.1)', color: 'rgba(249,115,22,0.5)', padding: '16px 36px',
              borderRadius: 8, fontSize: 15, fontWeight: 600,
              letterSpacing: '0.02em', border: '1px solid rgba(249,115,22,0.2)'
            }}>
              Registration Closed
            </span>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              <span>8.1 hrs</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
              <span>Offline · Hands-on</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
              <span>Build real MVP</span>
            </div>
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          color: 'rgba(255,255,255,0.15)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
          animation: 'fadeUp 1s 0.8s ease both'
        }}>
          <span>Scroll</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)' }} />
        </div>
      </section>

      {/* WHAT YOU'LL BUILD */}
      <section style={{ padding: '120px 40px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <FadeIn>
            <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f97316', marginBottom: 16, fontWeight: 600 }}>The output</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 60, lineHeight: 1.1 }}>
              One day.<br />Eight deliverables.
            </h2>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 2 }}>
            {builds.map(([icon, title, desc], i) => (
              <FadeIn key={i} delay={i * 60}>
                <div style={{
                  padding: '32px 24px', border: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s, border-color 0.2s', cursor: 'default'
                }}
                onMouseOver={e => { (e.currentTarget).style.background = 'rgba(249,115,22,0.06)'; (e.currentTarget).style.borderColor = 'rgba(249,115,22,0.2)'; }}
                onMouseOut={e => { (e.currentTarget).style.background = 'rgba(255,255,255,0.02)'; (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.05)'; }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFIED BY */}
      <section style={{ padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <FadeIn>
            <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 40, textAlign: 'center', fontWeight: 600 }}>Certification by</p>
          </FadeIn>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 64, flexWrap: 'wrap' }}>
            {[['DPIIT', 'Startup India'],['EDC Club', 'REC'],['TECHBUDDYSPACE', 'Pvt. Ltd']].map(([name, sub], i) => (
              <FadeIn key={i} delay={i * 100}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', fontFamily: "'Playfair Display', serif" }}>{name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4, letterSpacing: '0.05em' }}>{sub}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* REGISTER */}
      <section id="register" style={{ padding: '120px 40px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <FadeIn>
            <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f97316', marginBottom: 16, fontWeight: 600 }}>April 28, 2026</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 48, lineHeight: 1.1 }}>
              Reserve your seat.
            </h2>
          </FadeIn>

          <FadeIn delay={100}>
            <div style={{
              padding: '40px 32px', borderRadius: 12,
              border: '1px solid rgba(249,115,22,0.2)',
              background: 'rgba(249,115,22,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 40, marginBottom: 20 }}>🎉</div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(22px, 3vw, 30px)',
                fontWeight: 700, letterSpacing: '-0.02em',
                marginBottom: 12, color: '#fff'
              }}>
                Thank you for your interest!
              </h3>
              <p style={{
                fontSize: 15, color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.7, maxWidth: 360, margin: '0 auto'
              }}>
                Registration is now closed. We've received an overwhelming response and look forward to seeing everyone on <span style={{ color: '#f97316', fontWeight: 500 }}>April 28, 2026</span>.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700 }}>
          Startup<span style={{ color: '#f97316' }}>Starter</span>
        </span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
          © 2026 TECHBUDDYSPACE Pvt. Ltd × EDC Club, REC
        </span>
      </footer>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @keyframes pulse { 0%,100%{ opacity:1; } 50%{ opacity:0.4; } }
        * { box-sizing: border-box; margin:0; padding:0; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
```