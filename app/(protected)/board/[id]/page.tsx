'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAnnouncementById } from '@/lib/actions/announcements';
import InterestModal from '@/components/InterestModal';
import '../project-detail.css';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
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

  if (loading) return (
    <div className="detail-container">
      <p className="subtext">Loading project details...</p>
    </div>
  );

  if (!project) notFound();

  return (
    <div className="detail-container">
      <Link href="/board" className="detail-back">
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
        Back to Board
      </Link>

      <div className="detail-header">
        <div className="detail-badge-row">
          <span className="detail-badge" style={{ 
            color: project.author?.role === 'ENGINEER' ? '#3FABFC' : '#059669',
            background: project.author?.role === 'ENGINEER' ? 'rgba(63, 171, 252, 0.1)' : 'rgba(5, 150, 105, 0.1)'
          }}>
            {project.author?.role === 'ENGINEER' ? 'Engineer' : 'Healthcare'}
          </span>
          <span className="detail-badge" style={{ background: 'var(--surface-raised)', color: 'var(--on-background-muted)' }}>
            {project.domain}
          </span>
        </div>
        <h1 className="detail-title">{project.title}</h1>
        <div className="detail-author-info">
          By <span style={{ color: 'var(--on-background)', fontWeight: 600 }}>{project.author?.name || 'Research Lead'}</span>
          <span>·</span>
          <span>{project.author?.institution}</span>
          <span>·</span>
          <span>{project.city}, {project.country}</span>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          
          <section className="detail-section">
            <h2 className="detail-section-label">Detailed Information</h2>
            <div className="detail-text" style={{ whiteSpace: 'pre-wrap' }}>
              <p>{project.explanation}</p>
            </div>
          </section>

          <section className="detail-section">
            <h2 className="detail-section-label">Expertise Needed</h2>
            <div className="detail-text">
              <p>{project.expertiseNeeded}</p>
            </div>
          </section>

        </div>

        <aside className="detail-sidebar">
          <div className="detail-sidebar-box">
            <div className="sidebar-stat">
              <div className="sidebar-stat-label">Project Stage</div>
              <div className="sidebar-stat-value">{project.projectStage.replace(/_/g, ' ')}</div>
            </div>
            <div className="sidebar-stat">
              <div className="sidebar-stat-label">Commitment Level</div>
              <div className="sidebar-stat-value">{project.commitmentLevel}</div>
            </div>
            <div className="sidebar-stat">
              <div className="sidebar-stat-label">Posted</div>
              <div className="sidebar-stat-value">{project.time}</div>
            </div>
            <div className="sidebar-stat">
              <div className="sidebar-stat-label">Application Status</div>
              <div className="sidebar-stat-value" style={{ color: project.status === 'ACTIVE' ? '#059669' : 'inherit' }}>
                {project.status.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Action Bar */}
      <div className="detail-footer-bar">
        <button 
          className="interest-btn"
          onClick={() => setShowModal(true)}
        >
          Express Interest
        </button>
      </div>

      {/* Real Interest Modal */}
      <InterestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        projectId={project.id}
        projectTitle={project.title}
      />
    </div>
  );
}
