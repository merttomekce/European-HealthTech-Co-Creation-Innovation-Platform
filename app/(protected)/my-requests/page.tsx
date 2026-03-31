'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/StoreContext';
import SchedulingModal from '@/components/SchedulingModal';
import MeetingStatusPill from '@/components/MeetingStatusPill';
import './requests.css';

export default function MyRequestsPage() {
  const { interests, announcements, meetings, proposeMeetingSlots } = useStore();
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [selectedInterestId, setSelectedInterestId] = React.useState<string | null>(null);
  
  // For this demo, we'll assume the user with ID 'user-current' is the one viewing.
  // We'll also include 'user-eng-2' in the demo view so the user can see an "Accepted" state.
  const myInterests = interests.filter(i => ['user-current', 'user-eng-2'].includes(i.userId));

  const getProjectTitle = (projectId: string) => {
    const project = announcements.find(a => a.id === projectId);
    return project ? project.title : 'Unknown Project';
  };

  const getProjectDomain = (projectId: string) => {
    const project = announcements.find(a => a.id === projectId);
    return project ? project.domain : 'Medical';
  };

  const getMeeting = (interestId: string) => {
    return meetings.find(m => m.interestId === interestId);
  };

  return (
    <div className="requests-container">
      <header className="requests-header">
        <h1 className="requests-title">Your Requests</h1>
        <p className="requests-subtitle">Track the status of your project applications and pending collaborations.</p>
      </header>

      <div className="requests-list">
        {myInterests.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined emoji">rocket_launch</span>
            <h3>No requests yet.</h3>
            <p>Go to the board to find projects that match your expertise.</p>
            <Link href="/board" className="primary-btn">Explore Board</Link>
          </div>
        ) : (
          myInterests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-info">
                <span className="project-ref">{getProjectDomain(request.projectId)}</span>
                <Link href={`/board/${request.projectId}`} className="project-title-link">
                  {getProjectTitle(request.projectId)}
                </Link>
                <div className="request-meta">
                  <div className="meta-item">
                    <span className="material-symbols-outlined">schedule</span>
                    Applied {request.timestamp}
                  </div>
                  <div className="meta-item">
                    <span className="material-symbols-outlined">chat</span>
                    Message Sent
                  </div>
                </div>
              </div>

              <div className="request-status-section">
                <span className="status-label">Application Status</span>
                <span className={`status-badge ${request.status.toLowerCase()}`}>
                  {request.status === 'Accepted' ? 'Accepted - Negotiation Ready' : request.status}
                </span>

                {request.status === 'Accepted' && !getMeeting(request.id) && (
                  <button 
                    className="negotiate-btn"
                    onClick={() => {
                      setSelectedProjectId(request.projectId);
                      setSelectedInterestId(request.id);
                    }}
                  >
                    <span className="material-symbols-outlined">event</span>
                    Negotiate Meeting
                  </button>
                )}

                {getMeeting(request.id) && (
                  <MeetingStatusPill 
                    status={getMeeting(request.id)!.status}
                    confirmedTime={getMeeting(request.id)!.slots.find(s => s.status === 'Confirmed')?.label}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <SchedulingModal 
        isOpen={!!selectedProjectId}
        onClose={() => setSelectedProjectId(null)}
        projectTitle={getProjectTitle(selectedProjectId || '')}
        onPropose={(slots) => {
          if (selectedInterestId && selectedProjectId) {
            proposeMeetingSlots(selectedInterestId, selectedProjectId, slots);
          }
        }}
      />
    </div>
  );
}
