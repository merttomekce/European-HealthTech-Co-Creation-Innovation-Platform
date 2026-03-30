'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createAnnouncement } from '@/lib/actions/announcements';
import { createClient } from '@/lib/supabase/client';
import CustomSelect from '@/components/CustomSelect';
import SearchableSelect from '@/components/SearchableSelect';
import TagInput from '@/components/TagInput';
import { MEDICAL_DOMAINS, REQUIREMENT_TAGS } from '@/lib/data/options';
import { announcementSchema } from '@/lib/validations';
import './composer.css';

export default function ProjectComposerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ city: string, country: string } | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    domain: '',
    role: 'Engineer',
    pitch: '',
    clinicalContext: '',
    technicalChallenge: '',
    projectStage: 'Ideation',
    commitment: 'Part-time',
    requirementTags: [] as string[],
  });

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserProfile({ city: 'San Francisco', country: 'USA' }); 
      }
    }
    loadUser();
  }, []);

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
      const result = announcementSchema.pick({ title: true, domain: true }).safeParse(formData);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach(i => { if (i.path[0]) fieldErrors[i.path[0] as string] = i.message; });
        setErrors(fieldErrors);
        return;
      }
    }
    if (step === 2) {
      const result = announcementSchema.pick({ clinicalContext: true, technicalChallenge: true }).safeParse(formData);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach(i => { if (i.path[0]) fieldErrors[i.path[0] as string] = i.message; });
        setErrors(fieldErrors);
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setErrors({});
    const result = announcementSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(i => { if (i.path[0]) fieldErrors[i.path[0] as string] = i.message; });
      setErrors(fieldErrors);
      // If errors are on previous steps, we might need to jump back, but for now we validate step-by-step
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

    const apiResult = await createAnnouncement({
      title: formData.title,
      domain: formData.domain,
      publicPitch: formData.pitch || `Accelerating ${formData.domain} through co-creation.`,
      explanation: `Clinical Context: ${formData.clinicalContext}\n\nTechnical Challenge: ${formData.technicalChallenge}`,
      expertiseNeeded: formData.requirementTags.join(', '),
      projectStage: stageMap[formData.projectStage] || 'IDEA',
      commitmentLevel: commitmentMap[formData.commitment] || 'MEDIUM',
      city: userProfile?.city || 'Unknown',
      country: userProfile?.country || 'Unknown',
      confidentiality: 'PUBLIC_PITCH'
    } as any);

    if (apiResult.success) {
      router.push('/board');
    } else {
      setGlobalError(apiResult.error || 'Failed to post project');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="composer-container">
      <Link href="/board" className="subtext" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textDecoration: 'none' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
        Back to Board
      </Link>

      <header className="composer-header">
        <h1 className="text-serif" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Post a Project</h1>
        <p className="subtext">Clearly define your vision to attract the right interdisciplinary partner.</p>
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
            <p className="composer-subtitle">Define the core identity of your co-creation request.</p>
            
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
              label="Medical Domain"
              options={MEDICAL_DOMAINS}
              value={formData.domain}
              onChange={(val) => updateField('domain', val)}
              placeholder="e.g., Neurosurgery, Cardiology…"
              error={errors.domain}
            />

            <div className="form-group">
              <CustomSelect 
                label="Seeking Collaborator (Role)"
                options={[
                  { value: 'Engineer', label: 'Engineer / Tech Specialist' },
                  { value: 'Healthcare Professional', label: 'Healthcare Professional' }
                ]}
                value={formData.role}
                onChange={(val) => updateField('role', val)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2 className="composer-title">The Context</h2>
            <p className="composer-subtitle">Bridge the gap between clinical impact and technical complexity.</p>
            
            <div className="form-group">
              <label className="form-label text-sans">Clinical Impact (Context)</label>
              <textarea 
                className={`form-textarea ${errors.clinicalContext ? 'error' : ''}`} 
                placeholder="What medical problem are you solving? Why does this matter for patients?"
                value={formData.clinicalContext}
                onChange={(e) => updateField('clinicalContext', e.target.value)}
              />
              {errors.clinicalContext && <span className="field-error">{errors.clinicalContext}</span>}
            </div>

            <div className="form-group">
              <label className="form-label text-sans">Technical Challenge</label>
              <textarea 
                className={`form-textarea ${errors.technicalChallenge ? 'error' : ''}`} 
                placeholder="What are the engineering or scientific hurdles? What specific tech stack is involved?"
                value={formData.technicalChallenge}
                onChange={(e) => updateField('technicalChallenge', e.target.value)}
              />
              {errors.technicalChallenge && <span className="field-error">{errors.technicalChallenge}</span>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h2 className="composer-title">Logistics & Requirements</h2>
            <p className="composer-subtitle">Set clear expectations for your potential partner.</p>
            
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
            </div>

            <TagInput
              label="Partner Requirements"
              value={formData.requirementTags}
              onChange={(tags) => updateField('requirementTags', tags)}
              presets={REQUIREMENT_TAGS}
              placeholder="Select from above or add custom skills…"
              error={errors.requirements}
            />
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
          
          <button 
            className="btn-primary" 
            disabled={isSubmitting}
            onClick={() => step < 3 ? nextStep() : handleSubmit()}
          >
            {isSubmitting ? 'Posting...' : (step < 3 ? 'Continue' : 'Post Project')}
            {!isSubmitting && <span className="material-symbols-outlined">arrow_forward</span>}
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
        .form-input.error, .form-textarea.error {
          border-color: rgba(239, 68, 68, 0.4) !important;
        }
      `}</style>
    </div>
  );
}
