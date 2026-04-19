'use client';

import React, { useState } from 'react';
import { profileSchema } from '@/lib/validations';
import TagInput from '@/components/TagInput';
import SearchableSelect from '@/components/SearchableSelect';
import { updateProfile, getAuthProfile } from '@/lib/actions/profile';
import { COUNTRIES, HEALTHCARE_EXPERTISE_PRESETS, ENGINEER_EXPERTISE_PRESETS } from '@/lib/data/options';
import './profile.css';

// Helper: parse "City, Country" string back to parts
function parseLocation(location: string) {
  const parts = location.split(',').map((s) => s.trim());
  if (parts.length >= 2) {
    return { city: parts.slice(0, parts.length - 1).join(', '), country: parts[parts.length - 1] };
  }
  return { city: '', country: location };
}

export default function ProfilePage() {
  const initialLocation = parseLocation('Berlin, Germany');

  const [formData, setFormData] = useState({
    fullName: '',
    institution: '',
    country: '',
    city: '',
    expertiseTags: [] as string[],
    role: 'healthcare' as 'healthcare' | 'engineer' | 'admin',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    async function fetchProfile() {
      const res = await getAuthProfile();
      if (res.success && res.data) {
        setFormData({
          fullName: res.data.name || '',
          institution: res.data.institution || '',
          country: res.data.country || '',
          city: res.data.city || '',
          expertiseTags: res.data.expertise || [],
          role: res.data.role === 'ENGINEER' ? 'engineer' :
            res.data.role === 'ADMIN' ? 'admin' : 'healthcare',
        });
      }
      setIsLoading(false);
    }
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const locationString = formData.city
      ? `${formData.city}, ${formData.country}`
      : formData.country;

    const result = profileSchema.safeParse({
      ...formData,
      location: locationString,
      expertise: formData.expertiseTags.join(', '),
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsPending(true);
    try {
      await updateProfile({
        fullName: formData.fullName,
        institution: formData.institution,
        role: formData.role === 'engineer' ? 'engineer' : 'healthcare',
        location: locationString,
        expertise: formData.expertiseTags.join(', '),
      });
      setIsSaved(true);
    } catch (e) {
      alert("Failed to save changes.");
    } finally {
      setIsPending(false);
    }
  };

  const handleGdprAction = (action: string) => {
    alert(`Simulation: GDPR ${action} request queued.`);
  };

  const expertisePresets =
    formData.role === 'engineer' ? ENGINEER_EXPERTISE_PRESETS : HEALTHCARE_EXPERTISE_PRESETS;

  const initials = formData.fullName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (isLoading) {
    return <div className="profile-container"><div className="subtext">Loading profile...</div></div>;
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1 className="profile-title">Profile Settings</h1>
        <p className="profile-subtitle">Manage your personal information and privacy preferences.</p>
      </header>

      <div className="avatar-section">
        <div className="large-avatar">{initials}</div>
        <div className="avatar-info">
          <h2>{formData.fullName}</h2>
          <span className="read-only-role">
            {formData.role === 'healthcare'
              ? 'Healthcare Professional'
              : formData.role === 'engineer'
                ? 'Engineer / Tech Expert'
                : 'Administrator'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="form-section">
          <h3>Personal Details</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                className={`form-input ${errors.fullName ? 'error' : ''}`}
                value={formData.fullName}
                onChange={handleInputChange}
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            <div className="form-group full-width">
              <label className="form-label">Institution / Company</label>
              <input
                type="text"
                name="institution"
                className={`form-input ${errors.institution ? 'error' : ''}`}
                value={formData.institution}
                onChange={handleInputChange}
              />
              {errors.institution && <span className="field-error">{errors.institution}</span>}
            </div>

            {/* Country Select */}
            <div className="full-width">
              <SearchableSelect
                label="Country"
                options={COUNTRIES}
                value={formData.country}
                onChange={(val) => { setFormData((p) => ({ ...p, country: val })); setIsSaved(false); }}
                error={errors.country}
              />
            </div>

            {/* City */}
            <div className="form-group full-width">
              <label className="form-label">
                City <span style={{ color: 'var(--on-background-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="text"
                name="city"
                className="form-input"
                placeholder="Berlin"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Professional Context</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Short Bio (Optional)</label>
              <textarea
                name="bio"
                className="form-textarea"
                defaultValue="Cardiologist specializing in electrophysiology. Looking to collaborate on signal processing for wearable ECG devices."
                placeholder="Brief description of your background and goals…"
              />
            </div>

            {/* Expertise Tags */}
            <div className="full-width">
              <TagInput
                label="Expertise Tags"
                value={formData.expertiseTags}
                onChange={(tags) => { setFormData((p) => ({ ...p, expertiseTags: tags })); setIsSaved(false); }}
                presets={expertisePresets}
                placeholder="Type a skill and press Enter…"
                error={errors.expertise}
              />
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button type="submit" className="save-btn" disabled={isPending}>
              <span className="material-symbols-outlined">{isPending ? 'sync' : 'save'}</span>
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
            {isSaved && <span style={{ color: '#60a5fa', fontSize: '0.875rem' }}>Changes saved successfully.</span>}
          </div>
        </div>
      </form>

      <div className="form-section danger-section">
        <div className="danger-header">
          <span className="material-symbols-outlined">warning</span>
          <h3>Data &amp; Privacy (GDPR)</h3>
        </div>
        <p className="danger-desc">
          Per EU regulations, you have the right to request a complete archive of your data or permanently delete your
          account. Deleting your account will remove all your active announcements and break existing requests.
        </p>
        <div className="danger-actions">
          <button className="danger-btn" onClick={() => handleGdprAction('Data Export')}>
            Export My Data
          </button>
          <button
            className="danger-btn"
            onClick={() => handleGdprAction('Account Deletion')}
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
          >
            Delete Account
          </button>
        </div>
      </div>

      <style jsx>{`
        .field-error {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
          display: block;
        }
        .form-input.error {
          border-color: rgba(239, 68, 68, 0.5);
        }
      `}</style>
    </div>
  );
}
