'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/lib/actions/profile';
import { profileSchema } from '@/lib/validations';
import TagInput from '@/components/TagInput';
import SearchableSelect from '@/components/SearchableSelect';
import { COUNTRIES, HEALTHCARE_EXPERTISE_PRESETS, ENGINEER_EXPERTISE_PRESETS } from '@/lib/data/options';
import './onboarding.css';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    institution: '',
    role: '' as 'healthcare' | 'engineer' | '',
    country: '',
    city: '',
    expertiseTags: [] as string[],
  });

  const changeStep = (direction: 1 | -1) => {
    setAnimating(true);
    setTimeout(() => {
      setStep((s) => Math.max(1, Math.min(3, s + direction)));
      setAnimating(false);
    }, 180);
  };

  const nextStep = () => {
    setErrors({});
    setGlobalError(null);

    if (step === 1) {
      const result = profileSchema.pick({ fullName: true, institution: true }).safeParse(formData);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }
    if (step === 2 && !formData.role) {
      setErrors({ role: 'Please select a role to continue.' });
      return;
    }
    changeStep(1);
  };

  const prevStep = () => {
    setErrors({});
    setGlobalError(null);
    changeStep(-1);
  };

  const handleComplete = async () => {
    setErrors({});
    setGlobalError(null);

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

    if (!formData.country) {
      setErrors({ country: 'Please select your country.' });
      return;
    }

    startTransition(async () => {
      try {
        await updateProfile({
          fullName: formData.fullName,
          institution: formData.institution,
          role: formData.role as 'healthcare' | 'engineer',
          location: locationString,
          expertise: formData.expertiseTags.join(', '),
        });
        router.push('/dashboard');
      } catch (err: any) {
        setGlobalError(err.message || 'Something went wrong. Please try again.');
      }
    });
  };

  const expertisePresets =
    formData.role === 'engineer'
      ? ENGINEER_EXPERTISE_PRESETS
      : HEALTHCARE_EXPERTISE_PRESETS;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="onboarding-form">
            <h2>Your Identity</h2>
            <p>Tell us who you are. We focus on interdisciplinary transparency.</p>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className={`form-input ${errors.fullName ? 'error' : ''}`}
                placeholder="Dr. Sarah Chen"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Institution</label>
              <input
                type="text"
                className={`form-input ${errors.institution ? 'error' : ''}`}
                placeholder="Charité – Universitätsmedizin Berlin"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              />
              {errors.institution && <span className="field-error">{errors.institution}</span>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="onboarding-form">
            <h2>Select Your Role</h2>
            <p>Every account is verified by institutional domain.</p>
            {errors.role && <p className="field-error">{errors.role}</p>}
            <div className="role-cards">
              <div
                className={`role-card ${formData.role === 'healthcare' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'healthcare' })}
              >
                <div className="material-symbols-outlined role-icon">stethoscope</div>
                <div className="role-title">Healthcare Professional</div>
                <div className="role-desc">Doctor, clinician, or medical researcher looking for technical solutions.</div>
              </div>
              <div
                className={`role-card ${formData.role === 'engineer' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'engineer' })}
              >
                <div className="material-symbols-outlined role-icon">engineering</div>
                <div className="role-title">Engineer / Tech Expert</div>
                <div className="role-desc">Developer, AI expert, or hardware engineer looking for medical domain expertise.</div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="onboarding-form">
            <h2>Location &amp; Expertise</h2>
            <p>This allows us to match you with peers in your region.</p>

            {/* Country Select */}
            <SearchableSelect
              label="Country"
              options={COUNTRIES}
              value={formData.country}
              onChange={(val) => setFormData({ ...formData, country: val })}
              placeholder="Select your country…"
              error={errors.country}
            />

            {/* City (free text is fine here — too many cities) */}
            <div className="form-group">
              <label className="form-label">City <span style={{ color: 'var(--on-background-muted)', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="Berlin"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            {/* Expertise Tags */}
            <TagInput
              label="Expertise Tags"
              value={formData.expertiseTags}
              onChange={(tags) => setFormData({ ...formData, expertiseTags: tags })}
              presets={expertisePresets}
              placeholder="Select from above or type your own…"
              error={errors.expertise}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-sidebar">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>HealthAI</h1>
        <div className="onboarding-steps">
          {[
            { n: 1, label: 'Identity' },
            { n: 2, label: 'Role' },
            { n: 3, label: 'Expertise' },
          ].map(({ n, label }) => (
            <div
              key={n}
              className={`onboarding-step-indicator ${step === n ? 'active' : ''} ${step > n ? 'completed' : ''}`}
            >
              <div className="step-number">
                {step > n ? (
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                ) : (
                  n
                )}
              </div>
              <div className="step-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="onboarding-main">
        {globalError && (
          <div className="global-error-banner">
            {globalError}
          </div>
        )}

        <div className={`step-wrap ${animating ? 'step-exit' : 'step-enter'}`}>
          {renderStep()}
        </div>

        <div className="action-bar">
          {step > 1 && (
            <button className="back-btn" onClick={prevStep} disabled={isPending}>
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              className="primary-btn"
              onClick={nextStep}
              style={{ marginLeft: step === 1 ? 'auto' : '0' }}
              disabled={isPending}
            >
              Continue
            </button>
          ) : (
            <button
              className="primary-btn"
              onClick={handleComplete}
              style={{ marginLeft: 'auto' }}
              disabled={isPending}
            >
              {isPending ? 'Saving Profile…' : 'Complete Profile'}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .global-error-banner {
          margin-bottom: 1.5rem;
          padding: 1rem;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          font-size: 0.875rem;
        }
        .field-error {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
          display: block;
        }
        .form-input.error {
          border-color: rgba(239, 68, 68, 0.5);
        }
        .step-wrap {
          flex: 1;
          transition: opacity 0.18s ease, transform 0.18s ease;
        }
        .step-enter {
          opacity: 1;
          transform: translateY(0);
        }
        .step-exit {
          opacity: 0;
          transform: translateY(8px);
        }
        /* Completed step style */
        :global(.onboarding-step-indicator.completed .step-number) {
          background: var(--blue-primary) !important;
          color: #fff !important;
        }
      `}</style>
    </div>
  );
}
