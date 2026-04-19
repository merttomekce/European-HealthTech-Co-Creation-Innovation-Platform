'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '@/lib/actions/profile';
import '../profile.css';

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetch() {
      const res = await getUserProfile(params.id);
      if (res.success) {
        setUser(res.data);
      } else {
        alert(res.error || 'User not found');
        router.push('/dashboard');
      }
      setLoading(false);
    }
    fetch();
  }, [params.id, router]);

  if (loading) return <div className="profile-container"><p className="subtext">Loading user profile...</p></div>;
  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : user.email.substring(0, 2).toUpperCase();

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <button onClick={() => router.back()} className="icon-btn" style={{ padding: '0.5rem' }}>
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="profile-title">User Profile</h1>
        </div>
        <p className="profile-subtitle">Public professional overview for this platform member.</p>
      </header>

      <div className="avatar-section">
        <div className="large-avatar">{initials}</div>
        <div className="avatar-info">
          <h2>{user.name || 'Anonymous User'}</h2>
          <span className="read-only-role">
            {user.role === 'HEALTHCARE_PROFESSIONAL'
               ? 'Healthcare Professional'
               : user.role === 'ENGINEER'
               ? 'Engineer / Tech Expert'
               : 'Administrator'}
          </span>
        </div>
      </div>

      <div className="form-section">
        <h3>Professional Information</h3>
        <div className="view-grid">
            <div className="view-group">
                <label className="view-label">Institution / Company</label>
                <div className="view-value">{user.institution || 'Institutional affiliation not provided'}</div>
            </div>
            <div className="view-group">
                <label className="view-label">Location</label>
                <div className="view-value">
                    {user.city && user.country ? `${user.city}, ${user.country}` : user.country || user.city || 'Location not specified'}
                </div>
            </div>
            <div className="view-group full-width">
                <label className="view-label">Bio</label>
                <div className="view-value" style={{ whiteSpace: 'pre-wrap' }}>
                    {user.bio || 'No professional biography provided.'}
                </div>
            </div>
            <div className="view-group full-width">
                <label className="view-label">Expertise</label>
                <div className="expertise-tags-display">
                    {user.expertise && user.expertise.length > 0 ? (
                        user.expertise.map((tag: string) => (
                            <span key={tag} className="view-tag">{tag}</span>
                        ))
                    ) : (
                        <span className="subtext">No tags specified</span>
                    )}
                </div>
            </div>
        </div>
      </div>

      <style jsx>{`
        .view-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-top: 1rem;
        }
        .view-group.full-width {
            grid-column: 1 / -1;
        }
        .view-label {
            display: block;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--on-background-muted);
            margin-bottom: 0.5rem;
        }
        .view-value {
            font-size: 1rem;
            color: var(--on-background);
            line-height: 1.6;
        }
        .expertise-tags-display {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-top: 0.5rem;
        }
        .view-tag {
            background-color: var(--surface-raised);
            color: var(--primary);
            padding: 0.4rem 0.8rem;
            border-radius: 8px;
            font-size: 0.8125rem;
            font-weight: 600;
            border: 1px solid var(--outline);
        }
      `}</style>
    </div>
  );
}
