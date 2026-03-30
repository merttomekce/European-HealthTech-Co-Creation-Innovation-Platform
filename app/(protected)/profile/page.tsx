'use client';

import React, { useState } from 'react';
import { profileSchema } from '@/lib/validations';
import './profile.css';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    fullName: 'Dr. Sarah Chen',
    institution: 'Berlin Charité',
    location: 'Berlin, Germany',
    expertise: 'Cardiology, Electrophysiology, ECG',
    role: 'healthcare' as 'healthcare' | 'engineer' | 'admin'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsSaved(false);
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = profileSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsPending(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaved(true);
      setIsPending(false);
    }, 800);
  };

  const handeGdprAction = (action: string) => {
    alert(`Simulation: GDPR ${action} request queued.`);
  };

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1 className="profile-title">Profile Settings</h1>
        <p className="profile-subtitle">Manage your personal information and privacy preferences.</p>
      </header>

      <div className="avatar-section">
        <div className="large-avatar">SC</div>
        <div className="avatar-info">
          <h2>{formData.fullName}</h2>
          <span className="read-only-role">
            {formData.role === 'healthcare' ? 'Healthcare Professional' : 
             formData.role === 'engineer' ? 'Engineer / Tech Expert' : 'Administrator'}
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

            <div className="form-group full-width">
              <label className="form-label">Location (City, Country)</label>
              <input 
                type="text" 
                name="location" 
                className={`form-input ${errors.location ? 'error' : ''}`} 
                value={formData.location}
                onChange={handleInputChange}
              />
              {errors.location && <span className="field-error">{errors.location}</span>}
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
                placeholder="Brief description of your background and goals..."
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Expertise Tags</label>
              <input 
                type="text" 
                name="expertise" 
                className={`form-input ${errors.expertise ? 'error' : ''}`} 
                value={formData.expertise}
                onChange={handleInputChange}
              />
              {errors.expertise && <span className="field-error">{errors.expertise}</span>}
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button type="submit" className="save-btn" disabled={isPending}>
              <span className="material-symbols-outlined">
                {isPending ? 'sync' : 'save'}
              </span>
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
            {isSaved && <span style={{ color: '#60a5fa', fontSize: '0.875rem' }}>Changes saved successfully.</span>}
          </div>
        </div>
      </form>

      <div className="form-section danger-section">
        <div className="danger-header">
          <span className="material-symbols-outlined">warning</span>
          <h3>Data & Privacy (GDPR)</h3>
        </div>
        <p className="danger-desc">
          Per EU regulations, you have the right to request a complete archive of your data or permanently delete your account. 
          Deleting your account will remove all your active announcements and break existing requests.
        </p>
        <div className="danger-actions">
          <button className="danger-btn" onClick={() => handeGdprAction('Data Export')}>
            Export My Data
          </button>
          <button className="danger-btn" onClick={() => handeGdprAction('Account Deletion')} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
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
