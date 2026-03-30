'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/lib/actions/profile';
import './onboarding.css';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    institution: '',
    role: '' as 'healthcare' | 'engineer' | '',
    city: '',
    expertise: ''
  });

  const nextStep = () => {
    setError(null);
    if (step === 1 && (!formData.fullName || !formData.institution)) {
      setError("Please fill in your name and institution.");
      return;
    }
    if (step === 2 && !formData.role) {
      setError("Please select a role to continue.");
      return;
    }
    setStep(s => Math.min(s + 1, 3));
  };

  const prevStep = () => {
    setError(null);
    setStep(s => Math.max(s - 1, 1));
  };

  const handleComplete = async () => {
    if (!formData.city || !formData.expertise) {
      setError("Please provide your location and expertise.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await updateProfile({
          fullName: formData.fullName,
          institution: formData.institution,
          role: formData.role as 'healthcare' | 'engineer',
          location: formData.city,
          expertise: formData.expertise,
        });
        router.push('/board'); // Redirect to board (dashboard)
      } catch (err: any) {
        setError(err.message || "Something went wrong. Please try again.");
      }
    });
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="onboarding-form">
            <h2>Your Identity</h2>
            <p>Tell us who you are. We focus on interdisciplinary transparency.</p>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Dr. Sarah Chen"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Institution</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Charité - Universitätsmedizin Berlin"
                value={formData.institution}
                onChange={(e) => setFormData({...formData, institution: e.target.value})}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="onboarding-form">
            <h2>Select Your Role</h2>
            <p>Every account is verified by institutional domain.</p>
            <div className="role-cards">
              <div 
                className={`role-card ${formData.role === 'healthcare' ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, role: 'healthcare'})}
              >
                <div className="material-symbols-outlined role-icon">stethoscope</div>
                <div className="role-title">Healthcare Professional</div>
                <div className="role-desc">Doctor, clinician, or medical researcher looking for technical solutions.</div>
              </div>
              <div 
                className={`role-card ${formData.role === 'engineer' ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, role: 'engineer'})}
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
            <h2>Location & Expertise</h2>
            <p>This allows us to match you with peers in your region.</p>
            <div className="form-group">
              <label className="form-label">City, Country</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Berlin, Germany"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Core Tags</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Cardiology, Imaging, AI, etc."
                value={formData.expertise}
                onChange={(e) => setFormData({...formData, expertise: e.target.value})}
              />
            </div>
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
          <div className={`onboarding-step-indicator ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Identity</div>
          </div>
          <div className={`onboarding-step-indicator ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Role</div>
          </div>
          <div className={`onboarding-step-indicator ${step === 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Expertise</div>
          </div>
        </div>
      </div>

      <div className="onboarding-main">
        {error && (
          <div style={{ 
            marginBottom: '1.5rem', 
            padding: '1rem', 
            borderRadius: '8px', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {renderStep()}
        
        <div className="action-bar">
          {step > 1 && (
            <button 
              className="back-btn" 
              onClick={prevStep} 
              disabled={isPending}
            >
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
              {isPending ? 'Saving Profile...' : 'Complete Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
