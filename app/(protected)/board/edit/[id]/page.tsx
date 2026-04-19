'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateAnnouncement, getAnnouncementById } from '@/lib/actions/announcements';
import CustomSelect from '@/components/CustomSelect';
import SearchableSelect from '@/components/SearchableSelect';
import TagInput from '@/components/TagInput';
import CustomCheckbox from '@/components/CustomCheckbox';
import { MEDICAL_DOMAINS, REQUIREMENT_TAGS } from '@/lib/data/options';
import { announcementSchema } from '@/lib/validations';
import '../../create/composer.css';

export default function ProjectEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const [userRole, setUserRole] = useState<'ENGINEER' | 'HEALTHCARE' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { getNavProfile } = await import('@/lib/actions/profile');
      const profile = await getNavProfile();
      const loadedRole = profile.role.includes('Engineer') ? 'ENGINEER' : 'HEALTHCARE';
      setUserRole(loadedRole);

      const result = await getAnnouncementById(params.id);
      if (result.success && result.data) {
        const post = result.data;
        if (post.authorId !== user.id) {
          router.push('/board');
          return;
        }

        // Parse explanation back into fields based on role
        let context = post.explanation;
        let expertiseNeededText = post.explanation;
        
        if (loadedRole === 'HEALTHCARE') {
            const split = post.explanation.split('Technical Challenge: ');
            if (split.length > 1) {
                context = split[0].replace('Clinical Context: ', '').trim();
                expertiseNeededText = split[1].trim();
            }
        } else {
            const split = post.explanation.split('Healthcare Expertise Needed: ');
            if (split.length > 1) {
                context = split[0].replace('High-Level Idea: ', '').trim();
                expertiseNeededText = split[1].trim();
            }
        }

        // Reverse map commitments and stages
        const stageMap: any = { 'IDEA': 'Ideation', 'PROTOTYPE_DEVELOPED': 'Prototype', 'PILOT_TESTING': 'Testing', 'PRE_DEPLOYMENT': 'Scale' };
        const commitmentMap: any = { 'MEDIUM': 'Part-time', 'HIGH': 'Full-time', 'LOW': 'Project-based' };

        let daysRemaining = 30;
        if (post.expiresAt) {
            const diffTime = Math.abs(new Date(post.expiresAt).getTime() - new Date().getTime());
            daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }

        setFormData({
            title: post.title,
            domain: post.domain,
            pitch: post.publicPitch || '',
            context: context,
            expertiseNeededText: expertiseNeededText,
            projectStage: stageMap[post.projectStage] || 'Ideation',
            commitment: commitmentMap[post.commitmentLevel] || 'Part-time',
            collaborationType: post.collaborationType || 'ADVISOR',
            requirements: post.expertiseNeeded.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0),
            confidentiality: post.confidentiality,
            expiresInDays: daysRemaining,
            autoClose: post.autoClose,
            city: post.city || '',
            country: post.country || '',
        });
      }
      setIsLoading(false);
    }
    init();
  }, [params.id, router]);

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

    const explanationText = userRole === 'HEALTHCARE' 
      ? `Clinical Context: ${formData.context}\n\nTechnical Challenge: ${formData.expertiseNeededText}`
      : `High-Level Idea: ${formData.context}\n\nHealthcare Expertise Needed: ${formData.expertiseNeededText}`;

    const apiResult = await updateAnnouncement(params.id, {
      title: formData.title,
      domain: formData.domain,
      publicPitch: formData.pitch || `Accelerating ${formData.domain} through co-creation.`,
      explanation: explanationText,
      expertiseNeeded: formData.requirements.join(', '),
      projectStage: stageMap[formData.projectStage] || 'IDEA',
      commitmentLevel: commitmentMap[formData.commitment] || 'MEDIUM',
      collaborationType: formData.collaborationType,
      city: formData.city || 'Unknown',
      country: formData.country || 'Unknown',
      confidentiality: formData.confidentiality,
      expiresInDays: Number(formData.expiresInDays),
      autoClose: formData.autoClose,
      saveAsDraft
    } as any);

    if (apiResult.success) {
      router.push('/my-announcements');
    } else {
      setGlobalError(apiResult.error || 'Failed to update project');
      setIsSubmitting(false);
    }
  };

  if (isLoading || !userRole) return <div className="composer-container"><p>Loading form...</p></div>;

  return (
    <div className="composer-container">
      <Link href="/my-announcements" className="subtext" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textDecoration: 'none' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
        Cancel editing
      </Link>

      <header className="composer-header">
        <h1 className="text-serif" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Edit Project</h1>
        <p className="subtext">Update your co-creation request.</p>
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
                value={formData.pitch}
                onChange={(e) => updateField('pitch', e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="form-group">
                <label className="form-label text-sans">City</label>
                <input 
                  type="text" 
                  className={`form-input`} 
                  placeholder={'e.g. London'}
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label text-sans">Country</label>
                <input 
                  type="text" 
                  className={`form-input`} 
                  placeholder={'e.g. UK'}
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
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
                {userRole === 'HEALTHCARE' ? 'Clinical Context (Short Explanation)' : 'High-Level Idea (No sensitive details)'}
              </label>
              <textarea 
                className={`form-textarea ${errors.context ? 'error' : ''}`} 
                value={formData.context}
                onChange={(e) => updateField('context', e.target.value)}
              />
              {errors.context && <span className="field-error">{errors.context}</span>}
            </div>

            <div className="form-group">
              <label className="form-label text-sans">
                {userRole === 'HEALTHCARE' ? 'Desired Technical Expertise' : 'Healthcare Expertise Needed'}
              </label>
              <textarea 
                className={`form-textarea ${errors.expertiseNeededText ? 'error' : ''}`} 
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
              
              {userRole === 'HEALTHCARE' ? (
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
              {isSubmitting ? 'Processing...' : (step < 3 ? 'Continue' : 'Save Changes')}
              {!isSubmitting && step < 3 && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
