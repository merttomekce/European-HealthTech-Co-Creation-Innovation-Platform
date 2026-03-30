'use client';

import React from 'react';
import Link from 'next/link';
import { useStore, Interest } from '@/lib/StoreContext';
import MeetingStatusPill from '@/components/MeetingStatusPill';
import './manage.css';
import './requests.css';

export default function MyAnnouncementsPage() {
  const { announcements, interests, updateAnnouncementStatus, updateInterestStatus, meetings, confirmMeetingSlot } = useStore();
  
  // In a real app, we'd filter by current user ID. 
  // For this demo, we assume the user owns several projects.
  const myProjects = announcements.filter(a => ['1', '2', '3'].includes(a.id));

  const getApplicantsForProject = (projectId: string) => {
    return interests.filter(i => i.projectId === projectId);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Partner Found' : 'Active';
    updateAnnouncementStatus(id, nextStatus as any);
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
        {myProjects.map(project => {
          const projectApplicants = getApplicantsForProject(project.id);
          
          return (
            <div key={project.id} className="manage-card">
              <div className="manage-card-main">
                <div className="manage-card-info">
                  <div className="manage-card-meta">
                    <span className="manage-card-domain">{project.domain}</span>
                    <span className={`status-pill ${project.status.toLowerCase().replace(' ', '-')}`}>
                      {project.status}
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
                      Posted {project.time}
                    </div>
                  </div>
                </div>

                <div className="manage-card-actions">
                  <button 
                    className="action-btn secondary"
                    onClick={() => handleToggleStatus(project.id, project.status)}
                  >
                    {project.status === 'Active' ? 'Mark as Partnered' : 'Reactivate'}
                  </button>
                  <button className="action-btn outline">Edit</button>
                </div>
              </div>

              {/* Applicant Inbox Section */}
              {projectApplicants.length > 0 && (
                <div className="applicants-inbox">
                  <h3 className="inbox-title">Expressions of Interest ({projectApplicants.length})</h3>
                  <div className="applicant-list">
                    {projectApplicants.map(app => (
                      <div key={app.id} className="applicant-row-container">
                        <div className="applicant-row">
                          <div className="applicant-profile">
                            <div className="applicant-avatar">
                              {app.userName.charAt(0)}
                            </div>
                            <div className="applicant-details">
                              <span className="applicant-name">{app.userName}</span>
                              <span className="applicant-role">{app.userRole} • {app.userExpertise}</span>
                            </div>
                          </div>
                          
                          <div className="applicant-actions">
                            {app.status === 'Pending' ? (
                              <div className="button-group">
                                <button 
                                  className="btn-accept"
                                  onClick={() => updateInterestStatus(app.id, 'Accepted')}
                                >
                                  Accept & Schedule
                                </button>
                                <button 
                                  className="btn-decline"
                                  onClick={() => updateInterestStatus(app.id, 'Declined')}
                                >
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <div className="negotiation-status">
                                {meetings.find(m => m.interestId === app.id) ? (
                                  <MeetingStatusPill 
                                    status={meetings.find(m => m.interestId === app.id)!.status}
                                    confirmedTime={meetings.find(m => m.interestId === app.id)!.slots.find(s => s.status === 'Confirmed')?.label}
                                  />
                                ) : (
                                  <span className={`interest-status-badge status-${app.status.toLowerCase()}`}>
                                    {app.status === 'Accepted' ? 'Accepted - Waiting for Slots' : app.status}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Slots Review Section */}
                        {meetings.find(m => m.interestId === app.id)?.status === 'Negotiation' && (
                          <div className="slots-review-box">
                            <p className="slots-title">
                              <span className="material-symbols-outlined">event_note</span>
                              Review Proposed Slots
                            </p>
                            <div className="slots-list">
                              {meetings.find(m => m.interestId === app.id)!.slots.map(slot => (
                                <button 
                                  key={slot.id} 
                                  className="slot-confirm-btn"
                                  onClick={() => confirmMeetingSlot(meetings.find(m => m.interestId === app.id)!.id, slot.id)}
                                >
                                  {slot.label}
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
        })}
      </div>
    </div>
  );
}
