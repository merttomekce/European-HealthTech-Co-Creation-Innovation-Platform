'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createAnnouncement } from '@/lib/actions/announcements';
import CustomSelect from '@/components/CustomSelect';
import SearchableSelect from '@/components/SearchableSelect';
import TagInput from '@/components/TagInput';
import CustomCheckbox from '@/components/CustomCheckbox';
import { MEDICAL_DOMAINS, REQUIREMENT_TAGS } from '@/lib/data/options';
import { announcementSchema } from '@/lib/validations';
import { getAuthProfile } from '@/lib/actions/profile';
import './composer.css';

export default function ProjectComposerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [cityOptions, setCityOptions] = useState<Array<{ value: string; label: string; group?: string }>>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  
  const [userRole, setUserRole] = useState<'ENGINEER' | 'HEALTHCARE' | null>(null);
  const [userProfile, setUserProfile] = useState<{ city: string, country: string } | null>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    domain: '',
    pitch: '',
    context: '',
    expertiseNeededText: '',
    projectStage: 'Ideation',
    commitment: 'Part-time',
    collaborationType: 'ADVISOR',
    requirements: [] as string[],
    confidentiality: 'PUBLIC_PITCH',
    expiresInDays: 30,
    autoClose: false,
    city: '',
    country: '',
  });

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      setIsLoadingCountries(true);
      try {
        // 1. Fetch Countries
        const countryRes = await fetch('/api/location?type=countries');
        const countryData = await countryRes.json();
        let countryOptions = Array.isArray(countryData) ? countryData : [];

        // 2. Fetch Profile
        const profile = await getAuthProfile();
        let defaultCountry = '';
        let defaultCity = '';

        if (profile.success && profile.data) {
          defaultCountry = profile.data.country || '';
          defaultCity = profile.data.city || '';
          setUserProfile({ city: defaultCity, country: defaultCountry });

          // Ensure the default country is in the list
          if (defaultCountry && !countryOptions.some(c => c.value === defaultCountry)) {
            countryOptions.unshift({ value: defaultCountry, label: defaultCountry });
          }
        }
        
        setCountries(countryOptions);

        // 3. Set Form Data and PRE-FETCH Cities if country exists
        setFormData((prev) => ({
          ...prev,
          country: defaultCountry,
          city: defaultCity,
        }));

        if (defaultCountry) {
          setIsLoadingCities(true);
          try {
            const cityRes = await fetch(`/api/location?type=cities&countryCode=${encodeURIComponent(defaultCountry)}`);
            const cityData = await cityRes.json();
            const options = Array.isArray(cityData) ? cityData : [];
            if (defaultCity && !options.some((opt: any) => opt.value === defaultCity)) {
              options.unshift({ value: defaultCity, label: defaultCity });
            }
            setCityOptions(options);
          } catch (cityErr) {
            console.error('Failed to pre-fetch cities:', cityErr);
            if (defaultCity) setCityOptions([{ value: defaultCity, label: defaultCity }]);
          } finally {
            setIsLoadingCities(false);
          }
        }

        // 4. Determine Role
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (user) {
          const metaRole = user.user_metadata?.role;
          if (metaRole === 'engineer') {
            setUserRole('ENGINEER');
          } else if (metaRole === 'healthcare') {
            setUserRole('HEALTHCARE');
          } else {
            const { getNavProfile } = await import('@/lib/actions/profile');
            const navProfile = await getNavProfile();
            setUserRole(navProfile.role.includes('Engineer') ? 'ENGINEER' : 'HEALTHCARE');
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingCountries(false);
      }
    }
    init();
  }, [router]);

  useEffect(() => {
    async function loadCities() {
      if (!formData.country) {
        setCityOptions([]);
        return;
      }

      setIsLoadingCities(true);
      try {
        const res = await fetch(`/api/location?type=cities&countryCode=${encodeURIComponent(formData.country)}`);
        const data = await res.json();
        const options = Array.isArray(data) ? data : [];
        const currentCity = formData.city?.trim();
        if (currentCity && !options.some((opt: any) => opt.value === currentCity)) {
          options.unshift({ value: currentCity, label: currentCity });
        }
        setCityOptions(options);
      } catch (error) {
        console.error('Failed to load cities for composer:', error);
        const currentCity = formData.city?.trim();
        setCityOptions(currentCity ? [{ value: currentCity, label: currentCity }] : []);
      } finally {
        setIsLoadingCities(false);
      }
    }

    loadCities();
  }, [formData.country]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const nextStep = () => {
    setErrors({});
    if (step === 1) {
      const result = announcementSchema.pick({ title: true, domain: true }).safeParse({
        ...formData,
        clinicalContext: 'temp',
        technicalChallenge: 'temp',
      });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach(i => { if (i.path[0]) fieldErrors[i.path[0] as string] = i.message; });
        setErrors(fieldErrors);
        return;
      }
    }
    if (step === 2) {
      if (formData.context.length < 10) {
        setErrors({ context: 'Context must be at least 10 characters.'});
        return;
      }
      if (formData.expertiseNeededText.length < 10) {
        setErrors({ expertiseNeededText: 'Challenge explanation must be at least 10 characters.'});
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async (saveAsDraft: boolean = false) => {
    setErrors({});
    
    if (formData.requirements.length === 0) {
        setErrors({ requirements: 'At least one requirement is needed.' });
        return;
    }

    setIsSubmitting(true);
    setGlobalError(null);

    const stageMap: any = {
      'Ideation': 'IDEA',
      'Prototype': 'PROTOTYPE_DEVELOPED',
      'Testing': 'PILOT_TESTING',
      'Scale': 'PRE_DEPLOYMENT'
    };

    const commitmentMap: any = {
      'Part-time': 'MEDIUM',
      'Full-time': 'HIGH',
      'Project-based': 'LOW'
    };

    const role = userRole ?? 'HEALTHCARE';
    const explanationText = role === 'HEALTHCARE' 
      ? `Clinical Context: ${formData.context}\n\nTechnical Challenge: ${formData.expertiseNeededText}`
      : `High-Level Idea: ${formData.context}\n\nHealthcare Expertise Needed: ${formData.expertiseNeededText}`;

    const apiResult = await createAnnouncement({
      title: formData.title,
      domain: formData.domain,
      publicPitch: formData.pitch || `Accelerating ${formData.domain} through co-creation.`,
      explanation: explanationText,
      expertiseNeeded: formData.requirements.join(', '),
      projectStage: stageMap[formData.projectStage] || 'IDEA',
      commitmentLevel: commitmentMap[formData.commitment] || 'MEDIUM',
      collaborationType: formData.collaborationType,
      city: formData.city || userProfile?.city || 'Unknown',
      country: formData.country || userProfile?.country || 'Unknown',
      confidentiality: formData.confidentiality,
      expiresInDays: Number(formData.expiresInDays),
      autoClose: formData.autoClose,
      saveAsDraft
    } as any);

    if (apiResult.success) {
      router.push('/my-announcements');
    } else {
      setGlobalError(apiResult.error || 'Failed to post project');
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="composer-container"><p>Loading form...</p></div>;

  const activeRole = userRole ?? 'HEALTHCARE';

  return (
    <div className="composer-container">
      <Link href="/dashboard" className="subtext" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textDecoration: 'none' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
        Back to feed
      </Link>

      <header className="composer-header">
        <h1 className="text-serif" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Post a Project</h1>
        <p className="subtext">
          {activeRole === 'ENGINEER' ? 'Attract medical domain experts for your tech solution.' : 'Find the engineers needed to solve your clinical challenge.'}
        </p>
      </header>

      <div className="composer-step-indicator">
        {[1, 2, 3].map(s => (
          <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`} />
        ))}
      </div>

      <div className="composer-card">
        {step === 1 && (
          <div className="step-content">
            <h2 className="composer-title">The Basics</h2>
            
            <div className="form-group">
              <label className="form-label text-sans">Project Title</label>
              <input 
                type="text" 
                className={`form-input ${errors.title ? 'error' : ''}`} 
                placeholder="e.g., AI-assisted surgical navigation"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <SearchableSelect
              label="Working Domain"
              options={MEDICAL_DOMAINS}
              value={formData.domain}
              onChange={(val) => updateField('domain', val)}
              placeholder="e.g., Cardiology Imaging…"
              error={errors.domain}
            />

            <div className="form-group">
              <label className="form-label text-sans">Public Pitch (Short Idea)</label>
              <input 
                type="text" 
                className={`form-input`} 
                placeholder="A one-sentence hook for the public board."
                value={formData.pitch}
                onChange={(e) => updateField('pitch', e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="form-group">
                <SearchableSelect
                  label="Country"
                  options={countries}
                  value={formData.country}
                  onChange={(val) => {
                    updateField('country', val);
                    updateField('city', '');
                  }}
                  placeholder={isLoadingCountries ? 'Loading countries...' : 'Search countries…'}
                  disabled={isLoadingCountries}
                />
              </div>
              <div className="form-group">
                <SearchableSelect
                  label="City"
                  options={cityOptions}
                  value={formData.city}
                  onChange={(val) => updateField('city', val)}
                  placeholder={
                    isLoadingCities
                      ? 'Loading cities…'
                      : formData.country
                        ? 'Search cities…'
                        : 'Select country first'
                  }
                  disabled={!formData.country || isLoadingCities}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2 className="composer-title">The Details</h2>
            
            <div className="form-group">
              <label className="form-label text-sans">
                {activeRole === 'HEALTHCARE' ? 'Clinical Context (Short Explanation)' : 'High-Level Idea (No sensitive details)'}
              </label>
              <textarea 
                className={`form-textarea ${errors.context ? 'error' : ''}`} 
                placeholder={activeRole === 'HEALTHCARE' ? "What medical problem are you solving?" : "Explain your idea broadly."}
                value={formData.context}
                onChange={(e) => updateField('context', e.target.value)}
              />
              {errors.context && <span className="field-error">{errors.context}</span>}
            </div>

            <div className="form-group">
              <label className="form-label text-sans">
                {activeRole === 'HEALTHCARE' ? 'Desired Technical Expertise' : 'Healthcare Expertise Needed'}
              </label>
              <textarea 
                className={`form-textarea ${errors.expertiseNeededText ? 'error' : ''}`} 
                placeholder="What exactly are you looking for in a partner?"
                value={formData.expertiseNeededText}
                onChange={(e) => updateField('expertiseNeededText', e.target.value)}
              />
              {errors.expertiseNeededText && <span className="field-error">{errors.expertiseNeededText}</span>}
            </div>

             <div className="form-group">
              <CustomSelect 
                label="Confidentiality Level"
                options={[
                  { value: 'PUBLIC_PITCH', label: 'Public Pitch (Full details visible)' },
                  { value: 'DETAILS_IN_MEETING', label: 'Details Discussed in Meeting Only' }
                ]}
                value={formData.confidentiality}
                onChange={(val) => updateField('confidentiality', val)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h2 className="composer-title">Logistics & Requirements</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1rem' }}>
              <CustomSelect 
                label="Project Stage"
                options={[
                  { value: 'Ideation', label: 'Ideation' },
                  { value: 'Prototype', label: 'Prototype' },
                  { value: 'Testing', label: 'Clinical Testing' },
                  { value: 'Scale', label: 'Scaling' }
                ]}
                value={formData.projectStage}
                onChange={(val) => updateField('projectStage', val)}
              />
              
              {activeRole === 'HEALTHCARE' ? (
                <CustomSelect 
                  label="Commitment Level"
                  options={[
                    { value: 'Part-time', label: 'Part-time (Advisory)' },
                    { value: 'Full-time', label: 'Full-time (Co-founder)' },
                    { value: 'Project-based', label: 'Project-based (Consulting)' }
                  ]}
                  value={formData.commitment}
                  onChange={(val) => updateField('commitment', val)}
                />
              ) : (
                <CustomSelect 
                  label="Estimated Collaboration Type"
                  options={[
                    { value: 'ADVISOR', label: 'Advisor' },
                    { value: 'CO_FOUNDER', label: 'Co-Founder' },
                    { value: 'RESEARCH_PARTNER', label: 'Research Partner' }
                  ]}
                  value={formData.collaborationType}
                  onChange={(val) => updateField('collaborationType', val)}
                />
              )}
            </div>

            <TagInput
              label="Partner Requirement Tags"
              value={formData.requirements}
              onChange={(tags) => updateField('requirements', tags)}
              presets={REQUIREMENT_TAGS}
              placeholder="Add key skills…"
              error={errors.requirements}
            />

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label text-sans">Expiry (Days)</label>
                <input 
                  type="number" 
                  min="1" max="180"
                  className={`form-input`} 
                  value={formData.expiresInDays}
                  onChange={(e) => updateField('expiresInDays', e.target.value)}
                />
              </div>
              <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center' }}>
                <CustomCheckbox
                  id="autoClose"
                  label="Auto-close post when partner is found"
                  checked={formData.autoClose}
                  onChange={(val) => updateField('autoClose', val)}
                />
              </div>
            </div>
          </div>
        )}

        {globalError && (
          <div style={{ color: '#EF4444', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
            {globalError}
          </div>
        )}

        <div className="composer-actions">
          {step > 1 ? (
            <button className="btn-secondary" onClick={() => setStep(step - 1)} disabled={isSubmitting}>Back</button>
          ) : <div />}
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            {step === 3 && (
              <button 
                className="btn-secondary" 
                disabled={isSubmitting}
                onClick={() => handleSubmit(true)}
              >
                Save as Draft
              </button>
            )}
            
            <button 
              className="btn-primary" 
              disabled={isSubmitting}
              onClick={() => step < 3 ? nextStep() : handleSubmit(false)}
            >
              {isSubmitting ? 'Processing...' : (step < 3 ? 'Continue' : 'Post Project')}
              {!isSubmitting && step < 3 && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .field-error {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
          display: block;
        }
        .form-input.error, .form-textarea.error {
          border-color: rgba(239, 68, 68, 0.4) !important;
        }
      `}</style>
    </div>
  );
}
