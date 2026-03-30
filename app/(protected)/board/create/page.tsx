'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createAnnouncement } from '@/lib/actions/announcements';
import { createClient } from '@/lib/supabase/client';
import CustomSelect from '@/components/CustomSelect';
import './composer.css';

export default function ProjectComposerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    requirements: [''],
  });

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // In a real app, I'd fetch the profile from Prisma here
        // For now, I'll default to placeholders if not found
        setUserProfile({ city: 'San Francisco', country: 'USA' }); 
      }
    }
    loadUser();
  }, []);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newReqs = [...formData.requirements];
    newReqs[index] = value;
    updateField('requirements', newReqs);
  };

  const addRequirement = () => {
    updateField('requirements', [...formData.requirements, '']);
  };

  const removeRequirement = (index: number) => {
    const newReqs = formData.requirements.filter((_, i) => i !== index);
    updateField('requirements', newReqs.length ? newReqs : ['']);
  };

  const isStepValid = () => {
    if (step === 1) return formData.title && formData.domain;
    if (step === 2) return formData.clinicalContext && formData.technicalChallenge;
    if (step === 3) return formData.requirements.every(r => r.trim());
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    // Map UI values to Prisma Enums
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

    const result = await createAnnouncement({
      title: formData.title,
      domain: formData.domain,
      publicPitch: formData.pitch || `Accelerating ${formData.domain} through co-creation.`,
      explanation: `Clinical Context: ${formData.clinicalContext}\n\nTechnical Challenge: ${formData.technicalChallenge}`,
      expertiseNeeded: formData.requirements.filter(r => r.trim()).join(', '),
      projectStage: stageMap[formData.projectStage] || 'IDEA',
      commitmentLevel: commitmentMap[formData.commitment] || 'MEDIUM',
      city: userProfile?.city || 'Unknown',
      country: userProfile?.country || 'Unknown',
      confidentiality: 'PUBLIC_PITCH'
    } as any);

    if (result.success) {
      router.push('/board');
    } else {
      setError(result.error || 'Failed to post project');
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
                className="form-input" 
                placeholder="e.g., AI-assisted surgical navigation"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label text-sans">Medical Domain</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g., Neurosurgery, Cardiology"
                value={formData.domain}
                onChange={(e) => updateField('domain', e.target.value)}
              />
            </div>

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
                className="form-textarea" 
                placeholder="What medical problem are you solving? Why does this matter for patients?"
                value={formData.clinicalContext}
                onChange={(e) => updateField('clinicalContext', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label text-sans">Technical Challenge</label>
              <textarea 
                className="form-textarea" 
                placeholder="What are the engineering or scientific hurdles? What specific tech stack is involved?"
                value={formData.technicalChallenge}
                onChange={(e) => updateField('technicalChallenge', e.target.value)}
              />
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

            <div className="form-group">
              <label className="form-label text-sans">Specific Partner Requirements</label>
              <div className="requirements-list-editor">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="requirement-input-row">
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g., Deep understanding of DICOM standards"
                      value={req}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                    />
                    <button 
                      className="btn-icon" 
                      onClick={() => removeRequirement(index)}
                      style={{ border: 'none', color: '#EF4444' }}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
                <button className="btn-secondary" onClick={addRequirement} style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                  + Add Requirement
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ color: '#EF4444', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div className="composer-actions">
          {step > 1 ? (
            <button className="btn-secondary" onClick={() => setStep(step - 1)} disabled={isSubmitting}>Back</button>
          ) : <div />}
          
          <button 
            className="btn-primary" 
            disabled={!isStepValid() || isSubmitting}
            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
          >
            {isSubmitting ? 'Posting...' : (step < 3 ? 'Continue' : 'Post Project')}
            {!isSubmitting && <span className="material-symbols-outlined">arrow_forward</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
