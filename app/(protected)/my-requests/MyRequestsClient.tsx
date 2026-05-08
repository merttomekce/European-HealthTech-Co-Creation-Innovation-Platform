'use client';

import React from 'react';
import Link from 'next/link';
import SchedulingModal from '@/components/SchedulingModal';
import MeetingStatusPill from '@/components/MeetingStatusPill';
import { useRouter } from 'next/navigation';
import { proposeSlots, cancelMeetingRequest, confirmMeetingSlot } from '@/lib/actions/meetings';
import './requests.css';

export default function MyRequestsClient({ initialRequests }: { initialRequests: any[] }) {
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | null>(null);
  const router = useRouter();
  const [requests, setRequests] = React.useState(initialRequests);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isActionPending, setIsActionPending] = React.useState<Record<string, boolean>>({});

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
      const now = new Date();
      const dayMap: Record<string, number> = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5 };

      const dateSlots = slotLabels.map((label) => {
        const [dayName, timeStr] = label.split(', ');
        const targetDay = dayMap[dayName];
        
        const d = new Date(now);
        const currentDay = d.getDay();
        
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7;
        d.setDate(d.getDate() + daysToAdd);
        
        // Parse "10:00 AM"
        const [hourStr, part] = timeStr.split(' ');
        let [hours, minutes] = hourStr.split(':').map(Number);
        
        if (part === 'PM' && hours !== 12) hours += 12;
        if (part === 'AM' && hours === 12) hours = 0;
        
        d.setHours(hours, minutes, 0, 0);
        
        return { 
          startTime: d, 
          endTime: new Date(d.getTime() + 30 * 60000) 
        };
      });

      const res = await proposeSlots(selectedRequestId, dateSlots);
      if (res.success) {
        setRequests(prev => prev.map(r => r.id === selectedRequestId ? { ...r, status: 'SLOTS_PROPOSED' } : r));
        router.refresh(); // Refresh to get the latest slots in the UI
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSelectedProjectId(null);
      setSelectedRequestId(null);
      setIsLoading(false);
    }
  };

  const handleConfirmSlot = async (requestId: string, slotId: string) => {
    const actionKey = `slot-${slotId}`;
    if (isActionPending[actionKey]) return;

    setIsActionPending(prev => ({ ...prev, [actionKey]: true }));
    try {
      const res = await confirmMeetingSlot(requestId, slotId);
      if (res.success) {
        router.push(`/chats/${requestId}`);
      } else {
        window.alert('Failed to confirm slot.');
      }
    } catch (err) {
      window.alert('Error confirming slot.');
    } finally {
      setIsActionPending(prev => ({ ...prev, [actionKey]: false }));
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
            <p>Go to the feed to find projects that match your expertise.</p>
            <Link href="/dashboard" className="primary-btn">Explore Feed</Link>
          </div>
        ) : (
          requests.map(request => (
            <div key={request.id} id={`req-${request.id}`} className="request-card">
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                    <MeetingStatusPill 
                      status={request.status === 'CONFIRMED' ? 'Scheduled' : 'Negotiation'}
                      confirmedTime={request.status === 'CONFIRMED' ? 'Confirmed Date' : undefined}
                    />
                    
                    {request.status === 'SLOTS_PROPOSED' && request.proposedSlots?.length > 0 && (
                      <div className="slots-review-box" style={{ margin: '1rem 0 0 0', width: '100%' }}>
                        <p className="slots-title" style={{ fontSize: '0.7rem' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>event_note</span>
                          Confirm Proposed Slot
                        </p>
                        <div className="slots-list" style={{ gap: '0.5rem' }}>
                          {request.proposedSlots.map((slot: any) => (
                            <button 
                              key={slot.id} 
                              className={`slot-confirm-btn ${isActionPending[`slot-${slot.id}`] ? 'selected' : ''}`}
                              onClick={() => handleConfirmSlot(request.id, slot.id)}
                              disabled={Object.keys(isActionPending).some(k => k.startsWith('slot-'))}
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                            >
                              {isActionPending[`slot-${slot.id}`] ? '...' : new Date(slot.startTime).toLocaleString('en-US', { weekday: 'short', hour: '2-digit', minute:'2-digit' })}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
