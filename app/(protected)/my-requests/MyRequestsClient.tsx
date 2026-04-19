'use client';

import React from 'react';
import Link from 'next/link';
import SchedulingModal from '@/components/SchedulingModal';
import MeetingStatusPill from '@/components/MeetingStatusPill';
import { proposeSlots, cancelMeetingRequest } from '@/lib/actions/meetings';
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

    try {
      // Create actual Date objects for the proposed slots
      // Since it's a demo/test environment, we'll propose slots for the next 3 days at 10 AM, 2 PM, and 4 PM
      const now = new Date();
      const dateSlots = slotLabels.map((label, idx) => {
        const d = new Date(now);
        d.setDate(d.getDate() + (idx % 3) + 1); // Spread over next 3 days
        d.setHours(idx < 3 ? 10 : idx < 6 ? 14 : 16, 0, 0, 0);
        return { startTime: d, endTime: new Date(d.getTime() + 60 * 60000) }; // 1h meetings
      });

      const res = await proposeSlots(selectedRequestId, dateSlots);
      if (res.success) {
        setRequests(prev => prev.map(r => r.id === selectedRequestId ? { ...r, status: 'SLOTS_PROPOSED' } : r));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSelectedProjectId(null);
      setSelectedRequestId(null);
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this meeting request?')) return;
    
    setIsLoading(true);
    const res = await cancelMeetingRequest(requestId);
    if (res.success) {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'CANCELLED' } : r));
    } else {
      alert(res.error || 'Failed to cancel request');
    }
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

                {(request.status === 'PENDING' || request.status === 'ACCEPTED' || request.status === 'SLOTS_PROPOSED') && (
                  <button 
                    className="cancel-btn"
                    onClick={() => handleCancelRequest(request.id)}
                    disabled={isLoading}
                    title="Cancel Request"
                  >
                    <span className="material-symbols-outlined">cancel</span>
                    Cancel
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
