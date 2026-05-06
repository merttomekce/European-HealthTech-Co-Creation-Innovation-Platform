'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { getAnnouncementById } from '@/lib/actions/announcements';
import InterestModal from '@/components/InterestModal';
import '@/app/(protected)/board/project-detail.css';

export default function ProjectDetailModalPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function init() {
      const result = await getAnnouncementById(params.id);
      if (result.success) {
        setProject(result.data);
      } else {
        setProject(null);
      }
      setLoading(false);
    }

    init();
  }, [params.id]);

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
          <Link href="/board" className="detail-back">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to board
          </Link>
          <div className="detail-card" style={{ marginTop: '1rem' }}>
            <p className="detail-text">Project not found.</p>
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
          <Link href="/board" className="detail-back">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to board
          </Link>
          <Link href="/board" className="detail-modal-close" aria-label="Close detail">
            <X size={18} />
          </Link>
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
              <span className="summary-value">{project.time}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Status</span>
              <span className={`summary-value summary-value-status ${project.status === 'ACTIVE' ? 'active' : ''}`}>
                {project.status?.replace(/_/g, ' ') || 'UNKNOWN'}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Expertise</span>
              <span className="summary-value summary-truncate" title={project.expertiseNeeded}>
                {project.expertiseNeeded}
              </span>
            </div>
          </div>
        </section>

        <section className="detail-grid">
          <main className="detail-main">
            <article className="detail-card">
              <div className="detail-section-header">
                <p className="detail-section-kicker">Project context</p>
                <h2 className="detail-section-title">Detailed information</h2>
              </div>
              <div className="detail-text" style={{ whiteSpace: 'pre-wrap' }}>
                <p>{project.explanation}</p>
              </div>
            </article>

            <article className="detail-card">
              <div className="detail-section-header">
                <p className="detail-section-kicker">What is needed</p>
                <h2 className="detail-section-title">Expertise needed</h2>
              </div>
              <div className="detail-text">
                <p>{project.expertiseNeeded}</p>
              </div>
            </article>
          </main>

          <aside className="detail-sidebar">
            <div className="detail-sidecard">
            <div className="summary-row">
              <span className="summary-label">Project stage</span>
              <span className="summary-value">{project.projectStage?.replace(/_/g, ' ') || 'CONCEPT'}</span>
            </div>
              <div className="summary-row">
                <span className="summary-label">Collaboration type</span>
                <span className="summary-value">{project.collaborationType || 'ADVISOR'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Visibility</span>
                <span className="summary-value">{project.confidentiality}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Locality</span>
                <span className="summary-value">{project.city}, {project.country}</span>
              </div>
            </div>
          </aside>
        </section>

        <div className="detail-actions">
          <button className="detail-primary-btn" onClick={() => setShowModal(true)}>
            Express interest
          </button>
        </div>

        <InterestModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          projectId={project.id}
          projectTitle={project.title}
        />
      </div>
    </div>
  );
}
