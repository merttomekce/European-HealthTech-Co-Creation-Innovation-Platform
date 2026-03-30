'use client';

import React from 'react';
import { createClient } from '@/lib/supabase/client';

export default function HealthAILandingPage(): React.JSX.Element {
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'error' | 'success', text: string } | null>(null);
  
  // Environment Check
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured) {
      setMessage({ type: 'error', text: 'Supabase configuration missing. Please add your credentials to .env.local.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    // Basic EDU validation
    if (!email.toLowerCase().endsWith('.edu')) {
      setMessage({ type: 'error', text: 'Please use a valid .edu email address.' });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Check your inbox for the magic link!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Auth service is unavailable. Please check your Supabase setup.' });
    } finally {
      setIsLoading(false);
    }
  };

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [showIndicator, setShowIndicator] = React.useState(false);

  const ratiosRef = React.useRef<number[]>(new Array(5).fill(0));

  React.useEffect(() => {
    // 1. Intersection Observer for active sections
    const observer = new IntersectionObserver((entries) => {
      let shouldUpdate = false;
      entries.forEach((entry) => {
        const indexStr = entry.target.getAttribute('data-index');
        if (indexStr) {
          const idx = parseInt(indexStr, 10);
          ratiosRef.current[idx] = entry.intersectionRatio;
          shouldUpdate = true;
        }
      });
      
      if (shouldUpdate) {
        const maxRatio = Math.max(...ratiosRef.current);
        if (maxRatio > 0.1) {
          const newActiveIndex = ratiosRef.current.indexOf(maxRatio);
          setActiveIndex(newActiveIndex);
        }
      }
    }, { 
      root: null,
      threshold: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1] 
    });

    const sections = document.querySelectorAll('.mockup-section');
    sections.forEach(sec => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setShowIndicator(false);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setShowIndicator(true);
      }, 10000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial start timer
    scrollTimeout = setTimeout(() => {
      setShowIndicator(true);
    }, 10000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div className="landing-grid landing-page">
      
      {/* 1. STICKY LEFT: Hero & Auth */}
      <div className="sticky-left bg-health-grid">
        {/* Decorative Gradients for Grid */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '20vh', background: 'linear-gradient(to bottom, var(--background), transparent)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '20vh', background: 'linear-gradient(to top, var(--background), transparent)', pointerEvents: 'none' }}></div>

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ marginBottom: '3rem' }}>
            <h1 className="text-serif" style={{ marginBottom: '1.5rem', fontSize: '3.5rem', lineHeight: 1.1 }}>
              Co-Create the <br /> Future of Health
            </h1>
            <p className="subtext text-serif" style={{ fontSize: '1.25rem', opacity: 0.8, maxWidth: '400px', margin: '0 auto' }}>
              Bridge the clinical-tech gap. Browse needs, propose solutions, and co-create medical innovation on a secure platform.
            </p>
          </div>

          <div className="auth-box">
            <form onSubmit={handleSignIn}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5, marginBottom: '0.5rem', display: 'block' }}> Get Started </label>
                <input 
                  type="email" 
                  placeholder="Enter your .edu email" 
                  className="input-field" 
                  style={{ marginBottom: '0.75rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-white">Continue with email</button>
            </form>
            {message && (
              <div style={{ marginTop: '1rem', color: message.type === 'error' ? '#ef4444' : '#22c55e', fontSize: '0.875rem' }}>
                {message.text}
              </div>
            )}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--outline)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', opacity: 0.4 }}>
                Trusted by researchers from <br /> 40+ leading medical institutions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator Overlay */}
      <div className={`scroll-indicator-overlay ${showIndicator ? 'show' : ''}`}>
        {activeIndex > 0 && (
          <div className="scroll-icon-btn">
            <span className="material-symbols-outlined">expand_less</span>
          </div>
        )}
        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, fontWeight: 600 }}>
          {activeIndex === 0 ? 'Scroll to explore' : activeIndex === 4 ? 'End of tour' : 'Keep scrolling'}
        </div>
        {activeIndex < 4 && (
          <div className="scroll-icon-btn">
            <span className="material-symbols-outlined">expand_more</span>
          </div>
        )}
      </div>

      {/* 2. SCROLLING RIGHT: Feature Feed */}
      <div className="scroll-right">
        
        {/* Feature 1: The Board */}
        <section className="mockup-section" data-index="0">
          <div style={{ width: '100%', maxWidth: '900px' }}>
            <div className="mockup-header-tag">01. Discovery</div>
            <h2 className="text-serif" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>The Registry Board</h2>
            
            <div className="app-mockup-scrollable">
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--outline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fbbf24' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                  <span style={{ marginLeft: '1rem', fontSize: '0.85rem', opacity: 0.5 }}>healthai.app / board</span>
                </div>
              </div>
              <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem' }}>
                <div style={{ borderRight: '1px solid var(--outline)', paddingRight: '1rem' }}>
                  <div style={{ height: '0.75rem', width: '80%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '2rem' }}></div>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ height: '0.5rem', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '1rem' }}></div>
                  ))}
                </div>
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--outline)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <div style={{ width: '40px', height: '10px', background: i % 2 === 0 ? '#3b82f6' : '#10b981', borderRadius: '2px', opacity: 0.3 }}></div>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                        </div>
                        <div style={{ height: '0.8rem', width: '70%', background: 'var(--on-background)', opacity: 0.1, borderRadius: '2px', marginBottom: '0.5rem' }}></div>
                        <div style={{ height: '0.5rem', width: '90%', background: 'var(--on-background)', opacity: 0.05, borderRadius: '2px' }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 2: Analysis */}
        <section className="mockup-section" data-index="1">
          <div style={{ width: '100%', maxWidth: '900px' }}>
            <div className="mockup-header-tag">02. Insights</div>
            <h2 className="text-serif" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Contextual Deep Dive</h2>
            
            <div className="app-mockup-scrollable" style={{ background: '#0a0a0a' }}>
              <div style={{ display: 'flex', height: '100%' }}>
                <div style={{ flex: 1, padding: '3rem', borderRight: '1px solid var(--grid-line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ color: '#3b82f6' }}>neurology</span>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 600 }}>TAVI Workflow Analysis</h4>
                      <p style={{ fontSize: '0.8rem', opacity: 0.4 }}>Hospital ID: #TX-402</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ height: '1rem', width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: '2px' }}></div>
                    <div style={{ height: '1rem', width: '90%', background: 'rgba(255,255,255,0.03)', borderRadius: '2px' }}></div>
                    <div style={{ height: '1rem', width: '95%', background: 'rgba(255,255,255,0.03)', borderRadius: '2px' }}></div>
                    <div style={{ height: '1rem', width: '40%', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', marginTop: '1rem' }}></div>
                  </div>
                </div>
                <div style={{ width: '280px', padding: '2rem', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.3, marginBottom: '0.75rem', letterSpacing: '0.1em' }}>PRECISION METRICS</div>
                    <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Severity Index</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6' }}>8.4 / 10</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ height: '40px', width: '100%', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}></div>
                    <div style={{ height: '40px', width: '100%', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 3: Proposals */}
        <section className="mockup-section" data-index="2">
          <div style={{ width: '100%', maxWidth: '900px' }}>
            <div className="mockup-header-tag">03. Collaboration</div>
            <h2 className="text-serif" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Technical Proposals</h2>
            
            <div className="app-mockup-scrollable" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ width: '100%', maxWidth: '500px' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ flex: 1, padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--outline)', borderRadius: '12px', textAlign: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '32px', opacity: 0.2 }}>architecture</span>
                      <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>System Arch</div>
                    </div>
                    <div style={{ flex: 1, padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--outline)', borderRadius: '12px', textAlign: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '32px', opacity: 0.2 }}>inventory_2</span>
                      <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Resource Bid</div>
                    </div>
                  </div>
                  <div style={{ padding: '2rem', background: 'var(--background)', border: '1px solid var(--outline)', borderRadius: '16px' }}>
                    <div style={{ height: '0.75rem', width: '40%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '1.5rem' }}></div>
                    <div style={{ height: '3rem', width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--outline)', borderRadius: '8px', marginBottom: '1rem' }}></div>
                    <div style={{ height: '3rem', width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--outline)', borderRadius: '8px', marginBottom: '2rem' }}></div>
                    <button className="btn btn-blue" style={{ width: '100%', height: '3.5rem' }}>Submit Technical Bid</button>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Feature 4: Security */}
        <section className="mockup-section" data-index="3">
          <div style={{ width: '100%', maxWidth: '900px' }}>
            <div className="mockup-header-tag">04. Compliance</div>
            <h2 className="text-serif" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Protocol Trust Layer</h2>
            
            <div className="app-mockup-scrollable" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', border: '1px solid rgba(16, 185, 129, 0.2)', boxShadow: '0 0 40px rgba(16, 185, 129, 0.1)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#10b981' }}>security</span>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>HIPAA & IRB Ready</h3>
                <p style={{ opacity: 0.5, maxWidth: '300px', margin: '0 auto 2rem' }}>End-to-end encrypted protocol sharing with integrated NDA management.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span> Verified
                  </div>
                  <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history</span> Audit Log
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 5: Sync */}
        <section className="mockup-section" data-index="4">
          <div style={{ width: '100%', maxWidth: '900px' }}>
            <div className="mockup-header-tag">05. Delivery</div>
            <h2 className="text-serif" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Interdisciplinary Sync</h2>
            
            <div className="app-mockup-scrollable" style={{ padding: '0' }}>
               <div style={{ display: 'flex', height: '100%' }}>
                  <div style={{ width: '300px', borderRight: '1px solid var(--outline)', padding: '2rem' }}>
                    <div style={{ height: '0.75rem', width: '60%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '2rem' }}></div>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ padding: '1rem', background: i === 1 ? 'rgba(59, 130, 246, 0.1)' : 'transparent', borderRadius: '8px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ height: '0.5rem', width: '80%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                      <div style={{ alignSelf: 'flex-end', padding: '1rem', background: '#3b82f6', borderRadius: '12px 12px 0 12px', fontSize: '0.85rem', maxWidth: '70%', color: 'white' }}>
                        Ready for the clinical walkthrough on Friday?
                      </div>
                      <div style={{ alignSelf: 'flex-start', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px 12px 12px 0', fontSize: '0.85rem', maxWidth: '70%' }}>
                        Yes, I'll have the technical specs for the HIPAA storage ready by then.
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ flex: 1, height: '3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--outline)', borderRadius: '8px', padding: '0 1rem', display: 'flex', alignItems: 'center', opacity: 0.3, fontSize: '0.85rem' }}>Type a message...</div>
                      <div style={{ width: '3rem', height: '3rem', borderRadius: '8px', background: 'var(--on-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--background)' }}>
                        <span className="material-symbols-outlined">send</span>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
