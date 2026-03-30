import React from 'react';
import styles from './MeetingStatusPill.module.css';

interface MeetingStatusPillProps {
  status: 'Negotiation' | 'Scheduled' | 'Completed';
  confirmedTime?: string;
}

export default function MeetingStatusPill({ status, confirmedTime }: MeetingStatusPillProps) {
  const getStyles = () => {
    switch (status) {
      case 'Negotiation':
        return { background: 'rgba(255, 193, 7, 0.1)', color: '#FFC107', label: 'Proposal Sent' };
      case 'Scheduled':
        return { background: 'rgba(5, 150, 105, 0.1)', color: '#059669', label: `Confirmed: ${confirmedTime}` };
      case 'Completed':
        return { background: 'rgba(113, 113, 122, 0.1)', color: '#71717A', label: 'Previous Match' };
      default:
        return { background: 'rgba(255, 255, 255, 0.1)', color: 'white', label: status };
    }
  };

  const config = getStyles();

  return (
    <div 
      className={styles.pill} 
      style={{ background: config.background, color: config.color }}
    >
      <span className={`material-symbols-outlined ${styles.icon}`}>
        {status === 'Scheduled' ? 'event_available' : 'schedule'}
      </span>
      {config.label}
    </div>
  );
}
