'use client';

import React, { useState, useEffect } from 'react';
import { getPlatformSettings, updatePlatformSettings } from '@/lib/actions/settings';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowedDomains: '.edu, .ac.uk, .de, .fr, .nl, .se, .ch, .it',
    sessionTimeout: '24',
    postExpiry: '90',
    requireNDA: true,
    emailNotifications: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getPlatformSettings();
      if (res.success && res.data) {
        setSettings({
          maintenanceMode: res.data.maintenanceMode,
          allowedDomains: res.data.allowedDomains,
          sessionTimeout: res.data.sessionTimeout.toString(),
          postExpiry: res.data.postExpiry.toString(),
          requireNDA: res.data.requireNDA,
          emailNotifications: res.data.emailNotifications,
        });
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await updatePlatformSettings({
      maintenanceMode: settings.maintenanceMode,
      allowedDomains: settings.allowedDomains,
      sessionTimeout: parseInt(settings.sessionTimeout),
      postExpiry: parseInt(settings.postExpiry),
      requireNDA: settings.requireNDA,
      emailNotifications: settings.emailNotifications,
    });
    
    setIsSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert('Failed to save settings');
    }
  };

  if (isLoading) return <div className="admin-page-content">Loading settings...</div>;

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Platform Settings</h1>
        <p className="admin-page-subtitle">Configure global platform behaviour and defaults.</p>
      </div>

      {/* Access Control */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-title">Access Control</div>
          <div className="settings-section-desc">Restrict registration and authentication to trusted institutional domains.</div>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Allowed Email Domains</div>
            <div className="settings-row-desc">Comma-separated list. Users must register with an email matching one of these suffixes.</div>
          </div>
          <input
            type="text"
            name="allowedDomains"
            value={settings.allowedDomains}
            onChange={handleInputChange}
            style={{ background: 'var(--surface-container-highest)', border: '1px solid var(--outline)', color: 'var(--on-background)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '340px', fontFamily: 'monospace' }}
          />
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Session Timeout (hours)</div>
            <div className="settings-row-desc">Users are automatically signed out after this period of inactivity.</div>
          </div>
          <input
            type="number"
            name="sessionTimeout"
            min="1"
            max="168"
            value={settings.sessionTimeout}
            onChange={handleInputChange}
            style={{ background: 'var(--surface-container-highest)', border: '1px solid var(--outline)', color: 'var(--on-background)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100px', textAlign: 'center' }}
          />
        </div>
      </div>

      {/* Announcement Defaults */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-title">Announcement Defaults</div>
          <div className="settings-section-desc">Default behaviour for new posts on the registry board.</div>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Default Post Expiry (days)</div>
            <div className="settings-row-desc">Announcements auto-archive after this many days if not closed by the author.</div>
          </div>
          <input
            type="number"
            name="postExpiry"
            min="7"
            max="365"
            value={settings.postExpiry}
            onChange={handleInputChange}
            style={{ background: 'var(--surface-container-highest)', border: '1px solid var(--outline)', color: 'var(--on-background)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100px', textAlign: 'center' }}
          />
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Require NDA Acceptance</div>
            <div className="settings-row-desc">All applicants must accept the platform NDA before submitting interest.</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={settings.requireNDA} onChange={() => toggle('requireNDA')} aria-label="Require NDA Acceptance" />
            <span className="toggle-track" />
          </label>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Email Notifications</div>
            <div className="settings-row-desc">Send transactional emails for key events (match, meeting, expiry).</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={settings.emailNotifications} onChange={() => toggle('emailNotifications')} aria-label="Enable Email Notifications" />
            <span className="toggle-track" />
          </label>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="settings-section" style={{ borderColor: settings.maintenanceMode ? 'rgba(239,68,68,0.4)' : undefined }}>
        <div className="settings-section-header">
          <div className="settings-section-title">System Status</div>
          <div className="settings-section-desc">Control platform availability.</div>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Maintenance Mode</div>
            <div className="settings-row-desc">Puts the platform offline for all non-admin users. Use during deployments.</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={settings.maintenanceMode} onChange={() => toggle('maintenanceMode')} aria-label="Enable Maintenance Mode" />
            <span className="toggle-track" style={{ backgroundColor: settings.maintenanceMode ? '#ef4444' : undefined, borderColor: settings.maintenanceMode ? '#ef4444' : undefined }} />
          </label>
        </div>
        {settings.maintenanceMode && (
          <div className="maintenance-warning">
            <span className="material-symbols-outlined">warning</span>
            <p>Maintenance mode is <strong>ACTIVE</strong>. All participant-facing routes are returning 503. Only admin routes remain accessible. Disable this when the deployment is complete.</p>
          </div>
        )}
      </div>

      <div className="settings-actions">
        {saveSuccess && (
          <div className="save-toast">
            <span className="material-symbols-outlined">check_circle</span>
            Settings saved successfully!
          </div>
        )}
        <button 
          className="save-btn" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <style jsx>{`
        .settings-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1.5rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--outline);
        }
        .save-btn {
          background-color: #ef4444;
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .save-btn:hover:not(:disabled) {
          background-color: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }
        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .save-toast {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #22c55e;
          font-size: 0.875rem;
          font-weight: 500;
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
