'use client';

import React from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAuthRedirect } from '@/lib/actions/authRedirect';

export default function HealthAILandingPage(): React.JSX.Element {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLogin, setIsLogin] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [role, setRole] = React.useState('healthcare');
  const [message, setMessage] = React.useState<{ type: 'error' | 'success', text: string } | null>(null);
  
  // Environment Check
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient();
  
  React.useEffect(() => {
    const checkUser = async () => {
      if (window.location.search.includes('error=auth_failed')) {
        await supabase.auth.signOut();
        window.history.replaceState({}, document.title, window.location.pathname);
        setMessage({ type: 'error', text: 'Your session expired. Please sign in again.' });
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.href = '/dashboard';
      }
    };
    checkUser();
  }, [supabase]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured) {
      setMessage({ type: 'error', text: 'Supabase configuration missing. Please add your credentials to .env.local.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    // Basic validation
    if (!email.includes('@')) {
      setMessage({ type: 'error', text: 'Please use a valid email address.' });
      setIsLoading(false);
      return;
    }

    // Enforce institutional restriction for sign-ups (.edu anywhere in domain, or .ac.uk etc)
    const domainPart = email.toLowerCase().split('@')[1] || '';
    const isInstitutional = domainPart.includes('.edu') || domainPart.includes('.ac.');
    
    if (!isLogin && !isInstitutional) {
      setMessage({ type: 'error', text: 'Registration is restricted to institutional (.edu, .ac, etc.) email addresses only.' });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else {
          try {
            const redirectUrl = await getAuthRedirect();
            window.location.href = redirectUrl;
          } catch (e) {
             window.location.href = '/dashboard';
          }
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else {
          setMessage({ type: 'success', text: 'Check your inbox for the confirmation link to activate your account!' });
        }
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
            <form onSubmit={handleAuth}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5, marginBottom: '0.5rem', display: 'block' }}> 
                  {isLogin ? 'Welcome Back' : 'Create Account'} 
                </label>
                <input 
                  type="email" 
                  placeholder={isLogin ? "Enter your email" : "Enter your .edu email"} 
                  className="input-field" 
                  style={{ marginBottom: '0.75rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input 
                  type="password" 
                  placeholder="Enter your password" 
                  className="input-field" 
                  style={{ marginBottom: '0.75rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {!isLogin && (
                <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5, marginBottom: '0.5rem', display: 'block' }}> 
                    Select Your Role 
                  </label>
                  <select 
                    className="input-field" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)} 
                    style={{ marginBottom: '0.75rem', width: '100%', appearance: 'auto', background: 'var(--surface-container-highest)', color: 'var(--on-background)' }}
                  >
                    <option value="healthcare">Healthcare Professional</option>
                    <option value="engineer">Engineer / Tech Expert</option>
                  </select>
                </div>
              )}
              <button disabled={isLoading} type="submit" className="btn btn-white" style={{ opacity: isLoading ? 0.7 : 1 }}>
                {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
              </button>
              
              <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                <button 
                  type="button" 
                  onClick={() => { setIsLogin(!isLogin); setMessage(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--on-background)', textDecoration: 'underline', cursor: 'pointer', opacity: 0.7 }}
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>

              <button 
                type="button" 
                onClick={() => {
                  document.cookie = "dev_bypass=true; path=/;";
                  window.location.href = "/dashboard";
                }} 
                style={{ 
                  marginTop: '1.5rem', 
                  width: '100%', 
                  padding: '0.6rem',
                  background: 'transparent', 
                  border: '1px dashed var(--on-background-muted)', 
                  color: 'var(--on-background)',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  opacity: 0.5
                }}
              >
                [DEV] Force Bypass
              </button>
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
            <div className="mockup-header-tag">Step 01. Identity</div>
            <h2 className="text-serif" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Verified Institutional Entry</h2>
            
            <div className="app-mockup-scrollable">
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--outline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-container-high)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fbbf24' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                  <span style={{ marginLeft: '1rem', fontSize: '0.85rem', opacity: 0.5 }}>healthai.app / board</span>
                </div>
              </div>
              <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, var(--surface-container-low), var(--background))' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(34, 197, 94, 0.2)', animation: 'pulse 2s infinite' }}>
                        <span className="material-symbols-outlined" style={{ color: '#22c55e', fontSize: '40px' }}>verified_user</span>
                    </div>
                    <div style={{ position: 'absolute', top: -5, right: -5, width: '24px', height: '24px', background: '#22c55e', borderRadius: '50%', border: '3px solid var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '14px', fontWeight: 900 }}>check</span>
                    </div>
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Identity Verified</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.6, textAlign: 'center', maxWidth: '300px', lineHeight: 1.5 }}>
                    Your institutional association has been successfully validated via our secure domain trust protocol.
                </p>
                <div style={{ marginTop: '2rem', padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '99px', border: '1px solid var(--outline)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--on-background-muted)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                    TRUSTED DOMAIN: .EDU / .AC.UK
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 2: Analysis */}
        <section className="mockup-section" data-index="1">
          <div style={{ width: '100%', maxWidth: '900px' }}>
            <div className="mockup-header-tag">Step 02. Matching</div>
            <h2 className="text-serif" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Explore Clinical Needs</h2>
            
            <div className="app-mockup-scrollable" style={{ background: 'var(--surface)' }}>
              <div style={{ padding: '2rem', height: '100%', background: 'var(--background)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>CARDIOLOGY AI</div>
                    <div style={{ padding: '0.5rem 1rem', background: 'var(--surface-raised)', border: '1px solid var(--outline)', borderRadius: '20px', fontSize: '0.7rem', opacity: 0.6 }}>CITY: LONDON</div>
                    <div style={{ padding: '0.5rem 1rem', background: 'var(--surface-raised)', border: '1px solid var(--outline)', borderRadius: '20px', fontSize: '0.7rem', opacity: 0.6 }}>ACTIVE PROJECTS</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ padding: '1.25rem', border: '1px solid var(--outline)', borderRadius: '16px', background: 'var(--surface-container-high)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{ width: '20px', height: '4px', background: i === 1 ? '#3b82f6' : 'var(--outline)', borderRadius: '2px' }}></div>
                            <div style={{ width: '10px', height: '4px', background: 'var(--outline)', borderRadius: '2px' }}></div>
                        </div>
                        <div style={{ height: '12px', width: '80%', background: 'var(--on-background)', opacity: 0.15, borderRadius: '2px', marginBottom: '0.75rem' }}></div>
                        <div style={{ height: '6px', width: '95%', background: 'var(--on-background)', opacity: 0.05, marginBottom: '0.4rem' }}></div>
                        <div style={{ height: '6px', width: '70%', background: 'var(--on-background)', opacity: 0.05, marginBottom: '1.5rem' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#3b82f6', opacity: 0.8 }}>DETAILED SPEC</div>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', opacity: 0.3 }}>chevron_right</span>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 3: Proposals */}
        <section className="mockup-section" data-index="2">
          <div style={{ width: '100%', maxWidth: '900px' }}>
            <div className="mockup-header-tag">Step 03. Protocol</div>
            <h2 className="text-serif" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Secure Interest & Meeting</h2>
            
            <div className="app-mockup-scrollable" style={{ padding: '0', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ width: '100%', maxWidth: '440px', background: 'var(--surface-container-low)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--outline)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Interest Discovery</h5>
                    <span className="material-symbols-outlined" style={{ opacity: 0.2 }}>close</span>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ef4444' }}>contract</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>NDA Requirement Active</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ height: '40px', background: 'var(--surface-container-highest)', borderRadius: '6px', opacity: 0.5 }}></div>
                    <div style={{ height: '80px', background: 'var(--surface-container-highest)', borderRadius: '6px', opacity: 0.5 }}></div>
                    <button style={{ height: '44px', background: '#3b82f6', border: 'none', color: 'white', borderRadius: '6px', fontWeight: 600, marginTop: '0.5rem' }}>Accept NDA & Propose</button>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Feature 4: Security */}
        <section className="mockup-section" data-index="3">
          <div style={{ width: '100%', maxWidth: '900px' }}>
            <div className="mockup-header-tag">Step 04. Governance</div>
            <h2 className="text-serif" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Lifecycle Transparency</h2>
            
            <div className="app-mockup-scrollable" style={{ padding: '2rem', background: 'var(--surface)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <h5 style={{ fontSize: '1rem', fontWeight: 600 }}>Project Milestone History</h5>
                    <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>TRUST SCORE: 98%</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {[
                        { title: 'Protocol Published', desc: 'Secure clinical need registered', date: 'Oct 12', icon: 'campaign', color: '#3b82f6', active: true },
                        { title: 'Technical Matching', desc: 'Engineer expertise verified', date: 'Oct 14', icon: 'handshake', color: '#10b981', active: true },
                        { title: 'NDA Protocol Signed', desc: 'Legal barriers cleared', date: 'Oct 15', icon: 'verified', color: '#22c55e', active: true },
                        { title: 'Live Sync Scheduled', desc: 'Co-creation phase start', date: 'Pending', icon: 'event', color: 'var(--outline)', active: false },
                    ].map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1.5rem', minHeight: '80px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    background: step.active ? step.color : 'transparent', 
                                    border: `2px solid ${step.color}`, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    boxShadow: step.active ? `0 0 15px ${step.color}44` : 'none'
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: step.active ? 'white' : step.color }}>{step.icon}</span>
                                </div>
                                {i < 3 && <div style={{ width: '2px', flex: 1, background: step.active ? step.color : 'var(--outline)', opacity: step.active ? 0.3 : 1, margin: '4px 0' }}></div>}
                            </div>
                            <div style={{ flex: 1, paddingTop: '2px' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, opacity: step.active ? 1 : 0.4 }}>{step.title}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.3, marginBottom: '4px' }}>{step.desc}</div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.2 }}>{step.date}</div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', bottom: -20, right: 20, width: '150px', height: '150px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.05, pointerEvents: 'none' }}></div>
            </div>
          </div>
        </section>

        {/* Feature 5: Sync */}
        <section className="mockup-section" data-index="4">
          <div style={{ width: '100%', maxWidth: '900px' }}>
            <div className="mockup-header-tag">Step 05. Action</div>
            <h2 className="text-serif" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Role-Specific Dashboards</h2>
            
            <div className="app-mockup-scrollable" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <div style={{ background: 'var(--surface-container-low)', padding: '1.5rem', borderRight: '1px solid var(--outline)' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.4, marginBottom: '1.5rem', letterSpacing: '0.05em' }}>CLINICAL DASHBOARD</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ height: '40px', background: 'var(--background)', borderRadius: '6px', border: '1px solid var(--outline)', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#3b82f6' }}>calendar_month</span>
                                <div style={{ height: '4px', width: '50%', background: 'var(--on-background)', opacity: 0.15 }}></div>
                            </div>
                            <div style={{ height: '40px', background: 'var(--background)', borderRadius: '6px', border: '1px solid var(--outline)', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10b981' }}>verified</span>
                                <div style={{ height: '4px', width: '30%', background: 'var(--on-background)', opacity: 0.15 }}></div>
                            </div>
                        </div>
                    </div>
                    <div style={{ background: 'var(--background)', padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.4, marginBottom: '1.5rem', letterSpacing: '0.05em' }}>ENGINEER TERMINAL</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ height: '54px', background: 'var(--surface-container-highest)', borderRadius: '8px', padding: '0.75rem', border: '1px solid var(--outline)' }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                                    <div style={{ width: '4px', height: '4px', background: '#3b82f6', borderRadius: '50%' }}></div>
                                    <div style={{ width: '4px', height: '4px', background: '#3b82f6', borderRadius: '50%', opacity: 0.3 }}></div>
                                </div>
                                <div style={{ height: '4px', width: '80%', background: '#3b82f6', opacity: 0.2 }}></div>
                            </div>
                            <div style={{ height: '30px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#3b82f6', fontWeight: 800 }}>VIEW SPECS</div>
                        </div>
                    </div>
                </div>
                <div style={{ padding: '0.75rem 1.5rem', background: 'var(--surface-container-high)', borderTop: '1px solid var(--outline)', fontSize: '0.7rem', opacity: 0.4 }}>
                    Logged in as: research.lead@mit.edu
                </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
