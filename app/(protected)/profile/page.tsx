'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { profileSchema } from '@/lib/validations';
import TagInput from '@/components/TagInput';
import SearchableSelect from '@/components/SearchableSelect';
import { updateProfile, getAuthProfile, updateAvatar, exportUserData, changePassword, deleteAccount } from '@/lib/actions/profile';
import { HEALTHCARE_EXPERTISE_PRESETS, ENGINEER_EXPERTISE_PRESETS } from '@/lib/data/options';
import './profile.css';

const AVATAR_PRESETS = [
  '/avatars/avatar_1.svg',
  '/avatars/avatar_2.svg',
  '/avatars/avatar_3.svg',
  '/avatars/avatar_4.svg',
  '/avatars/avatar_5.svg',
  '/avatars/avatar_6.svg',
  '/avatars/avatar_7.svg',
  '/avatars/avatar_8.svg',
  '/avatars/avatar_9.svg',
  '/avatars/avatar_10.svg',
];

export default function ProfilePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    institution: '',
    bio: '',
    country: '',
    city: '',
    expertiseTags: [] as string[],
    role: 'healthcare' as 'healthcare' | 'engineer' | 'admin',
    image: null as string | null,
  });

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // Account deletion states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  // Dynamic location states
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  React.useEffect(() => {
    async function fetchProfile() {
      const res = await getAuthProfile();
      if (res.success && res.data) {
        setFormData({
          fullName: res.data.name || '',
          institution: res.data.institution || '',
          bio: res.data.bio || '',
          country: res.data.country || '',
          city: res.data.city || '',
          expertiseTags: res.data.expertise || [],
          role: res.data.role === 'ENGINEER' ? 'engineer' :
            res.data.role === 'ADMIN' ? 'admin' : 'healthcare',
          image: res.data.image || null,
        });
      }
      setIsLoading(false);
    }

    async function fetchCountries() {
      setIsLoadingCountries(true);
      try {
        const res = await fetch('/api/location?type=countries');
        const data = await res.json();
        setCountries(data);
      } catch (err) {
        console.error('Failed to fetch countries');
      } finally {
        setIsLoadingCountries(false);
      }
    }

    fetchProfile();
    fetchCountries();
  }, []);

  // Fetch cities when country changes
  React.useEffect(() => {
    if (!formData.country) {
      setCities([]);
      return;
    }

    async function fetchCities() {
      setIsLoadingCities(true);
      try {
        // Find the country object to get its name (API uses name for city lookup)
        const res = await fetch(`/api/location?type=cities&countryCode=${encodeURIComponent(formData.country)}`);
        const data = await res.json();
        setCities(data);
      } catch (err) {
        console.error('Failed to fetch cities');
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    }

    fetchCities();
  }, [formData.country]);

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
        bio: formData.bio,
      });
      setIsSaved(true);
    } catch (e) {
      alert("Failed to save changes.");
    } finally {
      setIsPending(false);
    }
  };

  const handleAvatarSelect = async (avatarUrl: string) => {
    setFormData(prev => ({ ...prev, image: avatarUrl }));
    setShowAvatarMenu(false);
    try {
      await updateAvatar(avatarUrl);
    } catch (err) {
      console.error("Failed to update avatar", err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, image: base64String }));
        setShowAvatarMenu(false);
        try {
          await updateAvatar(base64String);
        } catch (err) {
          console.error("Failed to upload avatar", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = async () => {
    setFormData(prev => ({ ...prev, image: null }));
    setShowAvatarMenu(false);
    try {
      await updateAvatar(null);
    } catch (err) {
      console.error("Failed to remove avatar", err);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await exportUserData();
      if (res.success && res.data) {
        const dataStr = JSON.stringify(res.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `healthai-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert("Failed to export data: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      alert("Something went wrong during export.");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      const res = await deleteAccount();
      if (res.success) {
        router.push('/?deleted=true');
      } else {
        setDeleteError(res.error || 'Failed to delete account.');
      }
    } catch {
      setDeleteError('Something went wrong. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!passwordData.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (res.success) {
        setPasswordSuccess(true);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(res.error || 'Failed to change password.');
      }
    } catch {
      setPasswordError('Something went wrong. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
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
    <div className="profile-page">
      <header className="profile-header">
        <h1 className="profile-title">Profile Settings</h1>
        <p className="profile-subtitle">Manage your personal information and privacy preferences.</p>
      </header>

      <div className="avatar-section">
        <div 
          className="large-avatar"
          onMouseEnter={() => setShowAvatarMenu(true)}
          onMouseLeave={() => setShowAvatarMenu(false)}
        >
          {formData.image ? (
            <img src={formData.image} alt="Avatar" />
          ) : (
            initials
          )}
          <div className="avatar-hover-overlay">
            <span className="material-symbols-outlined">edit</span>
          </div>

          {showAvatarMenu && (
            <div className="avatar-menu">
              <div className="avatar-menu-title">Select Avatar</div>
              <div className="avatar-presets">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    className={`avatar-preset-btn ${formData.image === preset ? 'active' : ''}`}
                    onClick={() => handleAvatarSelect(preset)}
                    type="button"
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} />
                  </button>
                ))}
              </div>
              <div className="avatar-actions">
                <button 
                  className="avatar-action-btn" 
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <span className="material-symbols-outlined">upload</span>
                  Upload from device
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <button 
                  className="avatar-action-btn remove" 
                  onClick={handleRemoveAvatar}
                  disabled={!formData.image}
                  type="button"
                >
                  <span className="material-symbols-outlined">delete</span>
                  Remove picture
                </button>
              </div>
            </div>
          )}
        </div>
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
                placeholder={isLoadingCountries ? "Loading countries..." : "Search countries..."}
                options={countries}
                value={formData.country}
                onChange={(val) => { 
                  setFormData((p) => ({ ...p, country: val, city: '' })); 
                  setIsSaved(false); 
                }}
                error={errors.country}
                disabled={isLoadingCountries}
              />
            </div>

            {/* City Searchable Select */}
            <div className="full-width" style={{ opacity: formData.country ? 1 : 0.5, transition: 'opacity 0.2s' }}>
              <SearchableSelect
                label="City"
                placeholder={isLoadingCities ? "Loading cities..." : (formData.country ? "Search cities..." : "Select country first")}
                options={cities}
                value={formData.city}
                onChange={(val) => { setFormData((p) => ({ ...p, city: val })); setIsSaved(false); }}
                error={errors.city}
                disabled={!formData.country || isLoadingCities}
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
                value={formData.bio}
                onChange={handleInputChange}
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

      {/* ─── Security: Change Password ─── */}
      <div className="form-section security-section">
        <div className="security-header">
          <span className="material-symbols-outlined">lock</span>
          <h3>Security</h3>
        </div>
        <p className="security-desc">
          Update your password to keep your account secure. You'll need to enter your current password first.
        </p>
        <form onSubmit={handlePasswordChange} className="password-form">
          <div className="password-field">
            <label className="form-label">Current Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                className="form-input"
                value={passwordData.currentPassword}
                onChange={(e) => { setPasswordData(p => ({ ...p, currentPassword: e.target.value })); setPasswordError(''); setPasswordSuccess(false); }}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                tabIndex={-1}
              >
                <span className="material-symbols-outlined">{showPasswords.current ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
          <div className="password-field">
            <label className="form-label">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                className="form-input"
                value={passwordData.newPassword}
                onChange={(e) => { setPasswordData(p => ({ ...p, newPassword: e.target.value })); setPasswordError(''); setPasswordSuccess(false); }}
                placeholder="Enter new password (min. 6 characters)"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                tabIndex={-1}
              >
                <span className="material-symbols-outlined">{showPasswords.new ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
          <div className="password-field">
            <label className="form-label">Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                className="form-input"
                value={passwordData.confirmPassword}
                onChange={(e) => { setPasswordData(p => ({ ...p, confirmPassword: e.target.value })); setPasswordError(''); setPasswordSuccess(false); }}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                tabIndex={-1}
              >
                <span className="material-symbols-outlined">{showPasswords.confirm ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          {passwordError && (
            <div className="password-feedback error">
              <span className="material-symbols-outlined">error</span>
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="password-feedback success">
              <span className="material-symbols-outlined">check_circle</span>
              Password changed successfully!
            </div>
          )}

          <button type="submit" className="password-save-btn" disabled={isChangingPassword}>
            <span className="material-symbols-outlined">{isChangingPassword ? 'sync' : 'lock_reset'}</span>
            {isChangingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

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
          <button className="danger-btn" onClick={handleExportData}>
            Export My Data
          </button>
          <button
            className="danger-btn delete-btn"
            onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); setDeleteError(''); }}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={() => !isDeleting && setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <h3>Delete your account?</h3>
            <p>
              This action is <strong>permanent and irreversible</strong>. All your data will be removed:
            </p>
            <ul className="delete-consequences">
              <li>Your profile and personal information</li>
              <li>All announcements you've created</li>
              <li>Meeting requests and conversations</li>
              <li>Notifications and activity history</li>
            </ul>
            <label className="delete-confirm-label">
              Type <strong>DELETE</strong> to confirm:
            </label>
            <input
              type="text"
              className="form-input delete-confirm-input"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              autoFocus
            />
            {deleteError && (
              <div className="password-feedback error" style={{ marginTop: '0.75rem' }}>
                <span className="material-symbols-outlined">error</span>
                {deleteError}
              </div>
            )}
            <div className="delete-modal-actions">
              <button
                className="delete-cancel-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="delete-confirm-btn"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              >
                <span className="material-symbols-outlined">{isDeleting ? 'sync' : 'delete_forever'}</span>
                {isDeleting ? 'Deleting…' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .profile-page {
          max-width: 980px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
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
      `}</style>
    </div>
  );
}
