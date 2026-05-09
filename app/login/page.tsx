'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DEMO_LOGIN, isDemoLogin } from '@/lib/demo-login';
import { resolveAuthFlowClient } from '@/lib/auth-flow-client';
import { isProfessionalEmail } from '@/lib/constants/emails';
import { sendEmailVerificationCode } from '@/lib/auth-email-otp';
import '../auth/auth-v2.css';


const trustPoints = [
  {
    title: 'Verified entry',
    copy: 'Institutional accounts keep project discussion credible.',
  },
  {
    title: 'Collaboration ready',
    copy: 'Jump into active projects without re-learning the interface.',
  },
  {
    title: 'Same shell everywhere',
    copy: 'Public, auth, and protected routes share one visual language.',
  },
] as const;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playLandingTransition = searchParams.get('from') === 'landing';
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [banner, setBanner] = React.useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace('/dashboard');
      }
    };
    checkSession();
  }, [router, supabase]);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setBanner(null);

    try {
      const normalized = email.trim().toLowerCase();

      if (!normalized) {
        setBanner({ type: 'error', text: 'Enter email first.' });
        return;
      }

      // 1. Block generic domains
      if (!isProfessionalEmail(normalized) && !isDemoLogin(normalized, DEMO_LOGIN.password)) {
        setBanner({ 
          type: 'error', 
          text: 'Institutional email required. Please use your work, hospital, or university address.' 
        });
        return;
      }

      // 2. Allow Demo Login bypass
      if (isDemoLogin(normalized, DEMO_LOGIN.password)) {

        router.push(`/login/password?email=${encodeURIComponent(normalized)}`);
        return;
      }

      if (!isSupabaseConfigured) {
        setBanner({ type: 'error', text: 'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' });
        return;
      }

      const result = await resolveAuthFlowClient(normalized);

      if (result.registered) {
        router.push(result.nextPath);
        return;
      }

      await sendEmailVerificationCode(supabase, normalized);
      router.push(`/auth/verify?email=${encodeURIComponent(normalized)}&next=${encodeURIComponent('/auth/register')}&sent=1`);
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Could not continue.' });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <main className={`auth-v2-container ${playLandingTransition ? 'auth-v2-animate-in' : ''}`}>
        <aside className="auth-v2-brand-side">
          <div className="auth-v2-brand-content">
            <h1>Clinical Needs.<br />Engineering Solutions.</h1>
            <p>
              Enter email first. We route registered users to password login and new users to profile setup.
            </p>
          </div>

          <div className="auth-v2-trust-list">
            {trustPoints.map(({ title, copy }) => (
              <div key={title} className="auth-v2-trust-item">
                <div>
                  <strong>{title}</strong>
                  <span>{copy}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="auth-v2-brand-footer">
            Secure institutional access. Shared project space.
          </div>
        </aside>

        <section className="auth-v2-form-side">
          <div className="auth-v2-form-card">
            <div className="auth-v2-eyebrow">Institutional Entrance</div>
            <h2 className="auth-v2-title">Enter work email</h2>

            {banner && <div className={`auth-v2-banner ${banner.type}`}>{banner.text}</div>}

            <form className="auth-v2-form" onSubmit={handleContinue}>
              <div className="auth-v2-group">
                <label className="auth-v2-label">Work Email</label>
                <input
                  type="email"
                  className="auth-v2-input"
                  placeholder="name@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="auth-v2-btn" disabled={isLoading}>
                {isLoading ? 'Checking...' : 'Continue'}
              </button>
            </form>

          </div>
        </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="auth-v2-container">Loading...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
