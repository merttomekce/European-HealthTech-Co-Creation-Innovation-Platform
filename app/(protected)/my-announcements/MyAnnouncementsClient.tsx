'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MeetingStatusPill from '@/components/MeetingStatusPill';
import { toggleAnnouncementStatus } from '@/lib/actions/announcements';
import { updateMeetingRequestStatus, confirmMeetingSlot } from '@/lib/actions/meetings';
import './manage.css';
import './requests.css';

export default function MyAnnouncementsClient({ initialData }: { initialData: any[] }) {
  const [projects, setProjects] = useState(initialData);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'IN_PROGRESS' : 'ACTIVE';
    const res = await toggleAnnouncementStatus(id, nextStatus);
    if (res.success) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
    }
  };

  const handleInterestStatus = async (projectId: string, requestId: string, newStatus: string) => {
    const res = await updateMeetingRequestStatus(requestId, newStatus);
    if (res.success) {
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            meetingRequests: p.meetingRequests.map((req: any) => 
              req.id === requestId ? { ...req, status: newStatus } : req
            )
          };
        }
        return p;
      }));
    }
  };

  const handleConfirmSlot = async (projectId: string, requestId: string, slotId: string) => {
    const res = await confirmMeetingSlot(requestId, slotId);
    if (res.success) {
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            meetingRequests: p.meetingRequests.map((req: any) => 
              req.id === requestId ? { ...req, status: 'CONFIRMED' } : req
            )
          };
        }
        return p;
      }));
    }
  };

  return (
    <div className="manage-container">
      <header className="manage-header">
        <div>
          <h1 className="manage-title">Manage Your Projects</h1>
          <p className="manage-subtitle">Track interest and coordinate with potential collaborators.</p>
        </div>
        <Link href="/board/create" className="create-btn">
          <span className="material-symbols-outlined">add</span>
          Post New Project
        </Link>
      </header>

      <div className="project-list">
        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
            You haven't posted any announcements yet.
          </div>
        ) : (
          projects.map(project => {
            const projectApplicants = project.meetingRequests || [];
            
            return (
              <div key={project.id} className="manage-card">
                <div className="manage-card-main">
                  <div className="manage-card-info">
                    <div className="manage-card-meta">
                      <span className="manage-card-domain">{project.domain}</span>
                      <span className={`status-pill ${project.status.toLowerCase().replace('_', '-')}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h2 className="manage-card-title">{project.title}</h2>
                    <div className="manage-card-stats">
                      <div className="stat-item">
                        <span className="material-symbols-outlined">group</span>
                        {projectApplicants.length} Interested
                      </div>
                      <div className="stat-item">
                        <span className="material-symbols-outlined">schedule</span>
                        Posted {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="manage-card-actions">
                    <button 
                      className="action-btn secondary"
                      onClick={() => handleToggleStatus(project.id, project.status)}
                    >
                      {project.status === 'ACTIVE' ? 'Mark as Partnered' : 'Reactivate'}
                    </button>
                    <button className="action-btn outline">Edit</button>
                  </div>
                </div>

                {projectApplicants.length > 0 && (
                  <div className="applicants-inbox">
                    <h3 className="inbox-title">Expressions of Interest ({projectApplicants.length})</h3>
                    <div className="applicant-list">
                      {projectApplicants.map((app: any) => (
                        <div key={app.id} className="applicant-row-container">
                          <div className="applicant-row">
                            <div className="applicant-profile">
                              <div className="applicant-avatar">
                                {app.requester.name?.charAt(0) || 'U'}
                              </div>
                              <div className="applicant-details">
                                <span className="applicant-name">{app.requester.name}</span>
                                <span className="applicant-role">{app.requester.role} • {app.requester.institution}</span>
                              </div>
                            </div>
                            
                            <div className="applicant-actions">
                              {app.status === 'PENDING' ? (
                                <div className="button-group">
                                  <button 
                                    className="btn-accept"
                                    onClick={() => handleInterestStatus(project.id, app.id, 'ACCEPTED')}
                                  >
                                    Accept Request
                                  </button>
                                  <button 
                                    className="btn-decline"
                                    onClick={() => handleInterestStatus(project.id, app.id, 'DECLINED')}
                                  >
                                    Decline
                                  </button>
                                </div>
                              ) : (
                                <div className="negotiation-status">
                                  {(app.status === 'SLOTS_PROPOSED' || app.status === 'CONFIRMED') ? (
                                    <MeetingStatusPill 
                                      status={app.status === 'CONFIRMED' ? 'Scheduled' : 'Negotiation'}
                                      confirmedTime={app.status === 'CONFIRMED' ? 'Confirmed Date' : undefined}
                                    />
                                  ) : (
                                    <span className={`interest-status-badge status-${app.status.toLowerCase()}`}>
                                      {app.status === 'ACCEPTED' ? 'Accepted - Waiting for them to propose slots' : app.status}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {app.status === 'SLOTS_PROPOSED' && (
                            <div className="slots-review-box">
                              <p className="slots-title">
                                <span className="material-symbols-outlined">event_note</span>
                                Review Proposed Slots
                              </p>
                              <div className="slots-list">
                                {app.proposedSlots?.map((slot: any) => (
                                  <button 
                                    key={slot.id} 
                                    className="slot-confirm-btn"
                                    onClick={() => handleConfirmSlot(project.id, app.id, slot.id)}
                                  >
                                    {new Date(slot.startTime).toLocaleString([], { weekday: 'short', hour: '2-digit', minute:'2-digit' })}
                                  </button>
                                ))}
                              </div>
                              <p className="slots-hint">Select one slot to confirm the meeting.</p>
                            </div>
                          )}

                          <p className="applicant-message-box">
                            "{app.message}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
