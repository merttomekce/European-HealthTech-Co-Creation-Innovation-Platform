'use client';

import React from 'react';
import Link from 'next/link';
import SchedulingModal from '@/components/SchedulingModal';
import MeetingStatusPill from '@/components/MeetingStatusPill';
import { proposeSlots } from '@/lib/actions/meetings';
import './requests.css';

export default function MyRequestsClient({ initialRequests }: { initialRequests: any[] }) {
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | null>(null);
  const [requests, setRequests] = React.useState(initialRequests);
  const [isLoading, setIsLoading] = React.useState(false);

  const getProjectTitle = (projectId: string) => {
    const project = requests.find(r => r.announcementId === projectId)?.announcement;
    return project ? project.title : 'Unknown Project';
  };

  const getProjectDomain = (projectId: string) => {
    const project = requests.find(r => r.announcementId === projectId)?.announcement;
    return project ? project.domain : 'Medical';
  };

  const handleProposeSlots = async (slotLabels: string[]) => {
    if (!selectedRequestId) return;
    setIsLoading(true);

    // Convert string labels to demo Dates for Prisma
    const dateSlots = slotLabels.map(label => {
      const now = new Date();
      return { startTime: now, endTime: new Date(now.getTime() + 30*60000) };
    });

    const res = await proposeSlots(selectedRequestId, dateSlots);
    if (res.success) {
      setRequests(prev => prev.map(r => r.id === selectedRequestId ? { ...r, status: 'SLOTS_PROPOSED' } : r));
    }
    
    setSelectedProjectId(null);
    setSelectedRequestId(null);
    setIsLoading(false);
  };

  return (
    <div className="requests-container">
      <header className="requests-header">
        <h1 className="requests-title">Your Requests</h1>
        <p className="requests-subtitle">Track the status of your project applications and pending collaborations.</p>
      </header>

      <div className="requests-list">
        {requests.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined emoji">rocket_launch</span>
            <h3>No requests yet.</h3>
            <p>Go to the board to find projects that match your expertise.</p>
            <Link href="/board" className="primary-btn">Explore Board</Link>
          </div>
        ) : (
          requests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-info">
                <span className="project-ref">{getProjectDomain(request.announcementId)}</span>
                <Link href={`/board/${request.announcementId}`} className="project-title-link">
                  {getProjectTitle(request.announcementId)}
                </Link>
                <div className="request-meta">
                  <div className="meta-item">
                    <span className="material-symbols-outlined">schedule</span>
                    Applied {new Date(request.createdAt).toLocaleDateString()}
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
                  {request.status.replace('_', ' ')}
                </span>

                {request.status === 'ACCEPTED' && (
                  <button 
                    className="negotiate-btn"
                    onClick={() => {
                      setSelectedProjectId(request.announcementId);
                      setSelectedRequestId(request.id);
                    }}
                    disabled={isLoading}
                  >
                    <span className="material-symbols-outlined">event</span>
                    Negotiate Meeting
                  </button>
                )}

                {(request.status === 'SLOTS_PROPOSED' || request.status === 'CONFIRMED') && (
                  <MeetingStatusPill 
                    status={request.status === 'CONFIRMED' ? 'Scheduled' : 'Negotiation'}
                    confirmedTime={request.status === 'CONFIRMED' ? 'Confirmed Date' : undefined}
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
        onPropose={handleProposeSlots}
      />
    </div>
  );
}
