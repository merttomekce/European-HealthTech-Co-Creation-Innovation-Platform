'use client';

import React, { useState } from 'react';
import './profile.css';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: 'Dr. Sarah Chen',
    institution: 'Berlin Charité',
    city: 'Berlin',
    country: 'Germany',
    bio: 'Cardiologist specializing in electrophysiology. Looking to collaborate on signal processing for wearable ECG devices.',
    expertise: 'Cardiology, Electrophysiology, ECG'
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => setIsSaved(true), 500);
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
          <h2>{formData.name}</h2>
          <span className="read-only-role">Healthcare Professional</span>
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
                name="name" 
                className="form-input" 
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group full-width">
              <label className="form-label">Institution / Company</label>
              <input 
                type="text" 
                name="institution" 
                className="form-input" 
                value={formData.institution}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input 
                type="text" 
                name="city" 
                className="form-input" 
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input 
                type="text" 
                name="country" 
                className="form-input" 
                value={formData.country}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Professional Context</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Short Bio</label>
              <textarea 
                name="bio" 
                className="form-textarea" 
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Brief description of your background and goals..."
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Expertise Tags (comma separated)</label>
              <input 
                type="text" 
                name="expertise" 
                className="form-input" 
                value={formData.expertise}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button type="submit" className="save-btn">
              <span className="material-symbols-outlined">save</span>
              Save Changes
            </button>
            {isSaved && <span style={{ color: 'var(--blue-primary)', fontSize: '0.875rem' }}>Changes saved successfully.</span>}
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
    </div>
  );
}
