'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/lib/actions/profile';
import { resolveAuthFlowClient } from '@/lib/auth-flow-client';
import { isProfessionalEmail } from '@/lib/constants/emails';
import SearchableSelect from '@/components/SearchableSelect';

import '../auth.css';
import '../auth-v2.css';

const trustPoints = [
  {
    icon: ShieldCheck,
    title: 'Verified entry',
    copy: 'Institutional accounts keep project discussion credible.',
  },
  {
    icon: UsersRound,
    title: 'Profile first',
    copy: 'Set role, institution, and collaboration context in one pass.',
  },
  {
    icon: Sparkles,
    title: 'Same shell everywhere',
    copy: 'Public, auth, and protected routes share one visual language.',
  },
] as const;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const verified = searchParams.get('verified') === '1';
  const [formData, setFormData] = React.useState({
    password: '',
    fullName: '',
    institution: '',
    role: 'healthcare' as 'healthcare' | 'engineer',
    country: '',
    city: '',
    expertise: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [banner, setBanner] = React.useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [countries, setCountries] = React.useState<Array<{ value: string; label: string; group?: string }>>([]);
  const [cities, setCities] = React.useState<Array<{ value: string; label: string }>>([]);
  const [isLoadingCountries, setIsLoadingCountries] = React.useState(false);
  const [isLoadingCities, setIsLoadingCities] = React.useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = React.useState(true);

  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    async function loadCountries() {
      setIsLoadingCountries(true);
      try {
        const res = await fetch('/api/location?type=countries');
        const data = await res.json();
        setCountries(Array.isArray(data) ? data : []);
      } catch (err) {
        setCountries([]);
      } finally {
        setIsLoadingCountries(false);
      }
    }

    loadCountries();
  }, []);

  React.useEffect(() => {
    if (!formData.country) {
      setCities([]);
      return;
    }

    async function loadCities() {
      setIsLoadingCities(true);
      try {
        const res = await fetch(`/api/location?type=cities&countryCode=${encodeURIComponent(formData.country)}`);
        const data = await res.json();
        setCities(Array.isArray(data) ? data : []);
      } catch (err) {
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    }

    loadCities();
  }, [formData.country]);

  React.useEffect(() => {
    if (!email) {
      router.replace('/login');
    }
  }, [email, router]);

  React.useEffect(() => {
    let isActive = true;

    async function precheckRegistration() {
      if (!email) {
        if (isActive) setIsCheckingEmail(false);
        return;
      }

      try {
        const result = await resolveAuthFlowClient(email);
        if (!isActive) return;
        if (result.registered) {
          router.replace(result.nextPath);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.email?.toLowerCase() !== email.toLowerCase()) {
          router.replace(`/auth/verify?email=${encodeURIComponent(email)}&next=${encodeURIComponent('/auth/register')}`);
          return;
        }

        if (!verified) {
          router.replace(`/auth/verify?email=${encodeURIComponent(email)}&next=${encodeURIComponent('/auth/register')}`);
          return;
        }
      } catch (error) {
        // Let the form load if the lookup backend is unavailable.
      } finally {
        if (isActive) setIsCheckingEmail(false);
      }
    }

    precheckRegistration();

    return () => {
      isActive = false;
    };
  }, [email, router, supabase, verified]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setBanner(null);

    try {
      if (!isSupabaseConfigured) {
        setBanner({ type: 'error', text: 'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' });
        return;
      }

      // Block generic domains (safety net)
      if (!isProfessionalEmail(email)) {
        setBanner({ 
          type: 'error', 
          text: 'Institutional email required. Please return to login and use your work address.' 
        });
        return;
      }

      // Client-side validation
      if (!formData.fullName || formData.fullName.trim().length < 2) {
        setBanner({ type: 'error', text: 'Please enter your full name (at least 2 characters).' });
        return;
      }
      if (!formData.institution || formData.institution.trim().length < 2) {
        setBanner({ type: 'error', text: 'Please enter your institution (at least 2 characters).' });
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setBanner({ type: 'error', text: 'Password must be at least 6 characters.' });
        return;
      }
      if (!formData.country) {
        setBanner({ type: 'error', text: 'Please select your country.' });
        return;
      }
      if (!formData.expertise || formData.expertise.trim().length < 2) {
        setBanner({ type: 'error', text: 'Please enter at least one expertise tag.' });
        return;
      }

      document.cookie = 'dev_bypass=; path=/; max-age=0; samesite=lax';

      const { error: passwordError } = await supabase.auth.updateUser({
        password: formData.password,
        data: {
          role: formData.role,
        },
      });

      if (passwordError) {
        setBanner({ type: 'error', text: passwordError.message });
        return;
      }

      await updateProfile({
        fullName: formData.fullName,
        institution: formData.institution,
        role: formData.role,
        location: `${formData.city}, ${formData.country}`.replace(/^,\s*/, '').trim(),
        expertise: formData.expertise,
      });

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Registration failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    isCheckingEmail ? (
      <main className="auth-v2-container"><div className="auth-v2-brand-side"><div className="auth-v2-brand-content"><h1>Checking email…</h1></div></div></main>
    ) : (
    <main className="auth-v2-container">
        <aside className="auth-v2-brand-side">
          <div className="auth-v2-brand-content">
            <h1>Clinical Needs.<br />Engineering Solutions.</h1>
            <p>
              New email detected. Create account, set profile, enter collaboration network.
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
            <div className="auth-v2-eyebrow">New account</div>
            <h2 className="auth-v2-title">Set up profile</h2>

            {banner && <div className={`auth-v2-banner ${banner.type}`}>{banner.text}</div>}

            <div className="auth-v2-help">Email</div>
            <div className="auth-v2-email-chip">{email || 'No email found'}</div>

            <form className="auth-v2-form" onSubmit={handleSubmit}>
              <div className="auth-v2-group">
                <label className="auth-v2-label">Password</label>
                <input
                  type="password"
                  className="auth-v2-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="auth-v2-form-grid">
                <div className="auth-v2-group">
                  <label className="auth-v2-label">Full name</label>
                  <input
                    type="text"
                    className="auth-v2-input"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="auth-v2-group">
                  <label className="auth-v2-label">Institution</label>
                  <input
                    type="text"
                    className="auth-v2-input"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    required
                  />
                </div>
                <div className="auth-v2-group">
                  <label className="auth-v2-label">Role</label>
                  <select
                    className="auth-v2-input auth-v2-role-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'healthcare' | 'engineer' })}
                  >
                    <option value="healthcare">Healthcare professional</option>
                    <option value="engineer">Engineer / tech expert</option>
                  </select>
                </div>
                <div className="auth-v2-group">
                  <label className="auth-v2-label">Expertise</label>
                  <input
                    type="text"
                    className="auth-v2-input"
                    value={formData.expertise}
                    onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                    required
                  />
                </div>
                <div className="auth-v2-group">
                  <SearchableSelect
                    label="Country"
                    options={countries}
                    value={formData.country}
                    onChange={(val) => setFormData({ ...formData, country: val, city: '' })}
                    placeholder="Select country"
                    error={undefined}
                    disabled={isLoadingCountries}
                  />
                </div>
                <div className="auth-v2-group">
                  <SearchableSelect
                    label="City"
                    options={cities}
                    value={formData.city}
                    onChange={(val) => setFormData({ ...formData, city: val })}
                    placeholder={formData.country ? "Select city" : "Select country first"}
                    error={undefined}
                    disabled={!formData.country || isLoadingCities}
                  />
                </div>
              </div>

              <button type="submit" className="auth-v2-btn" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="auth-v2-switch">
              Already registered? <button onClick={() => router.push('/login')} type="button">Back to login</button>
            </div>
          </div>
        </section>
    </main>
    )
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="auth-v2-container">Loading...</div>}>
      <RegisterForm />
    </React.Suspense>
  );
}
