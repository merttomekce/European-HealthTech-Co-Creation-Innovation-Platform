'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getAuthRedirect } from '@/lib/actions/authRedirect';
import { DEMO_LOGIN, isDemoLogin } from '@/lib/demo-login';
import '../auth/auth-v2.css';

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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [banner, setBanner] = React.useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient();

  React.useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const redirectUrl = await getAuthRedirect();
        router.replace(redirectUrl);
      }
    };
    checkSession();
  }, [router, supabase]);

  const submitCredentials = async (emailValue: string, passwordValue: string) => {
    setIsLoading(true);
    setBanner(null);

    try {
      if (isDemoLogin(emailValue, passwordValue)) {
        document.cookie = 'dev_bypass=true; path=/; max-age=86400; samesite=lax';
        router.push('/engineer/dashboard');
        router.refresh();
        return;
      }

      if (!isSupabaseConfigured) {
        setBanner({ type: 'error', text: 'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: emailValue, password: passwordValue });
      if (error) {
        setBanner({ type: 'error', text: error.message });
        return;
      }

      const redirectUrl = await getAuthRedirect();
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Login failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCredentials(email, password);
  };

  const handleDemoLogin = async () => {
    setEmail(DEMO_LOGIN.email);
    setPassword(DEMO_LOGIN.password);
    setBanner({ type: 'success', text: 'Test account loaded. Signing in now.' });
    await submitCredentials(DEMO_LOGIN.email, DEMO_LOGIN.password);
  };

  return (
    <main className="auth-v2-container">
      <aside className="auth-v2-brand-side">
        <Link href="/" className="auth-v2-logo">
          <span className="material-symbols-outlined" style={{ color: 'var(--orange-primary)' }}>lens_blur</span>
          HealthAI
        </Link>

        <div className="auth-v2-brand-content">
          <h1>Clinical Needs.<br />Engineering Solutions.</h1>
          <p>
            Join a verified network of clinicians and engineers collaborating on live clinical projects.
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
          <div className="auth-v2-eyebrow">Institutional Entrance</div>
          <h2 className="auth-v2-title">Welcome back</h2>

          {banner && <div className={`auth-v2-banner ${banner.type}`}>{banner.text}</div>}

          <form className="auth-v2-form" onSubmit={handleSubmit}>
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
              {isLoading ? 'Verifying...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-v2-switch">
            Don't have an account? <button onClick={() => router.push('/auth/complete-profile')} type="button">Sign up</button>
          </div>

          <button type="button" className="auth-v2-demo-account" onClick={handleDemoLogin} disabled={isLoading}>
            {isLoading ? 'Loading test account...' : 'Use test account'}
          </button>
        </div>
      </section>
    </main>
  );
}
