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
            April 30, 2026 · REC Campus
            April 30, 2026 · REC Campus
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

      {/* THANK YOU MESSAGE */}
      <section id="register" style={{ padding: '120px 40px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              background: 'rgba(34,197,94,0.1)', 
              border: '2px solid rgba(34,197,94,0.3)',
              marginBottom: 32
            }}>
              <span style={{ fontSize: 40 }}>✓</span>
            </div>
            
            <h2 style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: 'clamp(36px, 5vw, 56px)', 
              fontWeight: 800, 
              letterSpacing: '-0.03em', 
              marginBottom: 24, 
              lineHeight: 1.1,
              color: '#fff'
            }}>
              Thanks for the huge response!
            </h2>
            
            <p style={{ 
              fontSize: 18, 
              color: 'rgba(255,255,255,0.6)', 
              marginBottom: 48,
              lineHeight: 1.6
            }}>
              We've closed the registration form.
            </p>
          </FadeIn>

          <FadeIn delay={100}>
            <div style={{ 
              background: 'rgba(249,115,22,0.08)', 
              border: '1px solid rgba(249,115,22,0.2)', 
              borderRadius: 12, 
              padding: '48px 40px',
              marginBottom: 40
            }}>
              <h3 style={{ 
                fontSize: 24, 
                fontWeight: 700, 
                marginBottom: 32,
                color: '#f97316',
                letterSpacing: '-0.02em'
              }}>
                See you there!
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gap: 24, 
                textAlign: 'left',
                maxWidth: 480,
                margin: '0 auto'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <span style={{ fontSize: 24, marginTop: 4 }}>📅</span>
                  <div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>April 30, 2026</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <span style={{ fontSize: 24, marginTop: 4 }}>⏰</span>
                  <div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Time</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>8:00 AM - 5:00 PM</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <span style={{ fontSize: 24, marginTop: 4 }}>📍</span>
                  <div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Venue</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>KSL01 - Idea Factory, REC</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div style={{ 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: 12, 
              padding: '32px',
              marginBottom: 24
            }}>
              <h4 style={{ 
                fontSize: 20, 
                fontWeight: 700, 
                marginBottom: 16,
                color: '#fff',
                letterSpacing: '-0.02em'
              }}>
                Are you ready to make this event unforgettable?
              </h4>
              <p style={{ 
                fontSize: 16, 
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.6,
                marginBottom: 24
              }}>
                Reach the venue on time. We don't waste a minute!
              </p>
              
              <a 
                href="https://chat.whatsapp.com/Fr8RQtkjnGyGKovtqiVX68" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  background: '#25D366',
                  color: '#fff',
                  padding: '14px 28px',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 20px rgba(37, 211, 102, 0.3)',
                  cursor: 'pointer'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 30px rgba(37, 211, 102, 0.4)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(37, 211, 102, 0.3)';
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor"/>
                </svg>
                Still not joined? Join WhatsApp Group
              </a>
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