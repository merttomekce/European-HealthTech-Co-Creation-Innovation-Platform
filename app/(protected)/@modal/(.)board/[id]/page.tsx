'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { getAnnouncementById } from '@/lib/actions/announcements';
import InterestModal from '@/components/InterestModal';
import '@/app/(protected)/board/project-detail.css';

export default function ProjectDetailModalPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInterestForm, setShowInterestForm] = useState(false);

  useEffect(() => {
    async function init() {
      const result = await getAnnouncementById(params.id);
      if (result.success) {
        setProject(result.data);
      }
      setLoading(false);
    }
    init();
  }, [params.id]);

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="detail-modal-shell">
        <div className="detail-modal-surface detail-hero-loading">
          <div className="skeleton-line skeleton-kicker" />
          <div className="skeleton-block skeleton-detail-title" />
          <div className="skeleton-block skeleton-detail-copy" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="detail-modal-shell">
        <div className="detail-modal-surface">
          <div className="detail-modal-header" style={{ justifyContent: 'flex-end' }}>
            <button className="detail-modal-close" onClick={handleClose}><X size={18} /></button>
          </div>
          <div className="detail-card">
            <p>Project not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const lookingFor = project.author?.role === 'ENGINEER' ? 'Healthcare' : 'Engineer';
  const roleTone = project.author?.role === 'ENGINEER' ? 'engineer' : 'doctor';

  return (
    <div className="detail-modal-shell">
      <div className="detail-modal-surface">
        <div className="detail-modal-header">
          <div />
          <button className="detail-modal-close" onClick={handleClose}><X size={18} /></button>
        </div>

        <section className="detail-hero">
          <div className="detail-hero-copy">
            <div className="detail-badge-row">
              <span className={`detail-badge detail-badge-role ${roleTone}`}>Looking for {lookingFor}</span>
              <span className="detail-badge detail-badge-soft">{project.domain}</span>
              <span className="detail-badge detail-badge-soft">{project.projectStage?.replace(/_/g, ' ') || 'CONCEPT'}</span>
            </div>
            <h1 className="detail-title">{project.title}</h1>
            <div className="detail-author-info">
              <span>By</span>
              <strong>{project.author?.name || 'Research Lead'}</strong>
              <span>{project.author?.institution || 'Independent'}</span>
              <span>{project.city}, {project.country}</span>
            </div>
            <p className="detail-hero-copy-text">
              {project.publicPitch || project.explanation?.slice(0, 180) || 'Open collaboration thread.'}
            </p>
          </div>

          <div className="detail-summary-panel">
             <div className="summary-row">
              <span className="summary-label">Commitment</span>
              <span className="summary-value">{project.commitmentLevel}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Posted</span>
              <span className="summary-value">{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Status</span>
              <span className={`summary-value summary-value-status ${project.status === 'ACTIVE' ? 'active' : ''}`}>
                {project.status?.replace(/_/g, ' ') || 'UNKNOWN'}
              </span>
            </div>
            
            <button 
              className="btn-primary detail-cta" 
              onClick={() => setShowInterestForm(true)}
              disabled={project.status !== 'ACTIVE'}
            >
              {project.status === 'ACTIVE' ? 'I\'m Interested' : 'Post Closed'}
            </button>
          </div>
        </section>

        <div className="detail-grid">
          <div className="detail-main-content">
            <div className="detail-card">
              <h3 className="detail-card-title">Project Explanation</h3>
              <div className="detail-text" style={{ whiteSpace: 'pre-wrap' }}>
                {project.explanation}
              </div>
            </div>
          </div>

          <aside className="detail-sidebar">
            <div className="detail-sidecard">
              <h4 className="sidecard-title">Expertise Needed</h4>
              <div className="expertise-tags">
                {project.expertiseNeeded.split(',').map((tag: string) => (
                  <span key={tag} className="expertise-tag">{tag.trim()}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showInterestForm && (
        <InterestModal 
          project={project} 
          onClose={() => setShowInterestForm(false)} 
        />
      )}
    </div>
  );
}
