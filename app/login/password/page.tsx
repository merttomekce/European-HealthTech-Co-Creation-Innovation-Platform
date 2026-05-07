'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DEMO_LOGIN, isDemoLogin } from '@/lib/demo-login';
import '../../auth/auth-v2.css';

const trustPoints = [
  {
    icon: ShieldCheck,
    title: 'Verified entry',
    copy: 'Institutional accounts keep project discussion credible.',
  },
  {
    icon: UsersRound,
    title: 'Collaboration ready',
    copy: 'Jump into active projects without re-learning the interface.',
  },
  {
    icon: Sparkles,
    title: 'Same shell everywhere',
    copy: 'Public, auth, and protected routes share one visual language.',
  },
] as const;

function PasswordLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [banner, setBanner] = React.useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient();

  React.useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace('/dashboard');
      }
    };
    checkSession();
  }, [router, supabase]);

  React.useEffect(() => {
    if (!email) {
      router.replace('/login');
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setBanner(null);

    try {
      if (isDemoLogin(email, password)) {
        document.cookie = 'dev_bypass=true; path=/; max-age=86400; samesite=lax';
        router.push('/engineer/dashboard');
        router.refresh();
        return;
      }

      if (!isSupabaseConfigured) {
        setBanner({ type: 'error', text: 'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' });
        return;
      }

      document.cookie = 'dev_bypass=; path=/; max-age=0; samesite=lax';
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setBanner({ type: 'error', text: error.message });
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Login failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-v2-container">
        <aside className="auth-v2-brand-side">
          <div className="auth-v2-brand-content">
            <h1>Clinical Needs.<br />Engineering Solutions.</h1>
            <p>
              Registered email found. Enter password to continue into HealthAI.
            </p>
          </div>

          <div className="auth-v2-trust-list">
            {trustPoints.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="auth-v2-trust-item">
                <span className="auth-v2-trust-icon"><Icon size={16} aria-hidden="true" /></span>
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
            <div className="auth-v2-eyebrow">Welcome back</div>
            <h2 className="auth-v2-title">Enter password</h2>

            {banner && <div className={`auth-v2-banner ${banner.type}`}>{banner.text}</div>}

            <div className="auth-v2-help">Signed in as</div>
            <div className="auth-v2-email-chip">{email || 'No email found'}</div>

            <form className="auth-v2-form" onSubmit={handleSubmit}>
              <div className="auth-v2-group">
                <label className="auth-v2-label">Password</label>
                <input
                  type="password"
                  className="auth-v2-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="auth-v2-btn" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="auth-v2-switch">
              Wrong email? <button onClick={() => router.push('/login')} type="button">Change it</button>
            </div>
          </div>
        </section>
    </main>
  );
}

export default function PasswordLoginPage() {
  return (
    <React.Suspense fallback={<div className="auth-v2-container">Loading...</div>}>
      <PasswordLoginForm />
    </React.Suspense>
  );
}
