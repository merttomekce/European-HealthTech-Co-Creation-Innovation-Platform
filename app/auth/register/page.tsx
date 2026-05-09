'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/lib/actions/profile';
import { isProfessionalEmail } from '@/lib/constants/emails';
import SearchableSelect from '@/components/SearchableSelect';

import '../auth.css';
import '../auth-v2.css';

type RegistrationDraft = {
  password: string;
  fullName: string;
  institution: string;
  role: 'healthcare' | 'engineer';
  country: string;
  city: string;
  expertise: string;
};

const emptyDraft: RegistrationDraft = {
  password: '',
  fullName: '',
  institution: '',
  role: 'healthcare',
  country: '',
  city: '',
  expertise: '',
};

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

function draftStorageKey(email: string) {
  return `healthai-register-draft:${email.trim().toLowerCase()}`;
}

function readDraft(email: string): RegistrationDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(draftStorageKey(email));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<RegistrationDraft>;
    return {
      ...emptyDraft,
      ...parsed,
    };
  } catch {
    return null;
  }
}

function writeDraft(email: string, draft: RegistrationDraft) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(draftStorageKey(email), JSON.stringify(draft));
}

function clearDraft(email: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(draftStorageKey(email));
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams.get('email') || '').trim().toLowerCase();
  const [formData, setFormData] = React.useState<RegistrationDraft>(emptyDraft);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [banner, setBanner] = React.useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [countries, setCountries] = React.useState<Array<{ value: string; label: string; group?: string }>>([]);
  const [cities, setCities] = React.useState<Array<{ value: string; label: string }>>([]);
  const [isLoadingCountries, setIsLoadingCountries] = React.useState(false);
  const [isLoadingCities, setIsLoadingCities] = React.useState(false);

  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    if (!email) {
      router.replace('/login');
      return;
    }

    const savedDraft = readDraft(email);
    if (savedDraft) {
      setFormData(savedDraft);
    }
  }, [email, router]);

  React.useEffect(() => {
    async function loadCountries() {
      setIsLoadingCountries(true);
      try {
        const res = await fetch('/api/location?type=countries');
        const data = await res.json();
        setCountries(Array.isArray(data) ? data : []);
      } catch {
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
      } catch {
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    }

    loadCities();
  }, [formData.country]);

  const finalizeRegistration = React.useCallback(
    async (draft: RegistrationDraft) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Click the confirmation link in your email first.');
      }

      if (!email || user.email?.toLowerCase() !== email) {
        throw new Error('This account does not match the email on the form.');
      }

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          role: draft.role,
        },
      });

      if (metadataError) {
        throw metadataError;
      }

      await updateProfile({
        fullName: draft.fullName,
        institution: draft.institution,
        role: draft.role,
        location: `${draft.city}, ${draft.country}`.replace(/^,\s*/, '').trim(),
        expertise: draft.expertise,
      });

      clearDraft(email);
      router.push('/dashboard');
      router.refresh();
    },
    [email, router, supabase],
  );

  React.useEffect(() => {
    let active = true;

    async function maybeCompleteRegistration() {
      if (!email) return;

      const savedDraft = readDraft(email);
      if (!savedDraft) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!active || !user || user.email?.toLowerCase() !== email) {
          return;
        }

        setIsCompleting(true);
        await finalizeRegistration(savedDraft);
      } catch {
        // Keep the form visible if the confirmation flow is not ready yet.
      } finally {
        if (active) {
          setIsCompleting(false);
        }
      }
    }

    maybeCompleteRegistration();

    return () => {
      active = false;
    };
  }, [email, finalizeRegistration, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setBanner(null);

    try {
      if (!isSupabaseConfigured) {
        setBanner({ type: 'error', text: 'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' });
        return;
      }

      if (!isProfessionalEmail(email)) {
        setBanner({
          type: 'error',
          text: 'Institutional email required. Please return to login and use your work address.',
        });
        return;
      }

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

      writeDraft(email, formData);

      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/auth/register')}&email=${encodeURIComponent(email)}`;
      const { error } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            role: formData.role,
          },
        },
      });

      if (error) {
        clearDraft(email);
        setBanner({ type: 'error', text: error.message });
        return;
      }

      setBanner({
        type: 'success',
        text: `We sent a confirmation link to ${email}. Open it to finish setting up your account.`,
      });
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Registration failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  return email ? (
    <main className="auth-v2-container">
      <aside className="auth-v2-brand-side">
        <div className="auth-v2-brand-content">
          <h1>Clinical Needs.<br />Engineering Solutions.</h1>
          <p>
            Create your account, then confirm the email link we send before we finish the setup.
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
          <div className="auth-v2-email-chip">{email}</div>

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
                  placeholder={formData.country ? 'Select city' : 'Select country first'}
                  error={undefined}
                  disabled={!formData.country || isLoadingCities}
                />
              </div>
            </div>

            <button type="submit" className="auth-v2-btn" disabled={isLoading || isCompleting}>
              {isCompleting ? 'Finishing account...' : isLoading ? 'Sending link...' : 'Create account'}
            </button>
          </form>

          <div className="auth-v2-switch">
            Already registered? <button onClick={() => router.push('/login')} type="button">Back to login</button>
          </div>
        </div>
      </section>
    </main>
  ) : (
    <main className="auth-v2-container">
      <div className="auth-v2-brand-side">
        <div className="auth-v2-brand-content">
          <h1>Checking email…</h1>
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="auth-v2-container">Loading...</div>}>
      <RegisterForm />
    </React.Suspense>
  );
}
