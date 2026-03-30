'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/StoreContext';
import './notifications.css';

const DEMO_USER_ID = 'user-current';

export default function NotificationsPage() {
  const { notifications, markNotificationsAsRead } = useStore();
  
  // Filter for the current user's notifications
  const myNotifications = notifications.filter(n => n.userId === DEMO_USER_ID);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Meeting': return 'event';
      case 'StatusUpdate': return 'check_circle';
      case 'Message': return 'chat';
      default: return 'notifications';
    }
  };

  return (
    <div className="notifications-container">
      <header className="notifications-header">
        <div>
          <h1 className="notifications-title">Notifications</h1>
          <p className="notifications-subtitle">Updates on your collaborations and requests.</p>
        </div>
        <button 
          className="mark-read-btn"
          onClick={() => markNotificationsAsRead(DEMO_USER_ID)}
          disabled={myNotifications.every(n => n.isRead)}
        >
          Mark all as read
        </button>
      </header>

      <div className="notifications-list">
        {myNotifications.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined emoji">notifications_off</span>
            <h3>You&apos;re all caught up.</h3>
            <p>You don&apos;t have any notifications right now.</p>
          </div>
        ) : (
          myNotifications.map(notification => (
            <Link 
              key={notification.id} 
              href={notification.link || '#'} 
              className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
            >
              <div className="notification-icon">
                <span className="material-symbols-outlined">{getIconForType(notification.type)}</span>
              </div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{notification.timestamp}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
