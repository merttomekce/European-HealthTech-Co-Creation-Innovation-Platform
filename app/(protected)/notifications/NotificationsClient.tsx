'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { markAllAsRead } from '@/lib/actions/notifications';
import './notifications.css';

export default function NotificationsClient({ initialData }: { initialData: any[] }) {
  const [notifications, setNotifications] = useState(initialData);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'MEETING_REQUEST': return 'event';
      case 'SLOTS_PROPOSED': return 'schedule';
      case 'STATUS_UPDATE': return 'check_circle';
      case 'MESSAGE': return 'chat';
      default: return 'notifications';
    }
  };

  const handleMarkAllRead = async () => {
    const res = await markAllAsRead();
    if (res.success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
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
          onClick={handleMarkAllRead}
          disabled={notifications.every(n => n.isRead)}
        >
          Mark all as read
        </button>
      </header>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined emoji">notifications_off</span>
            <h3>You&apos;re all caught up.</h3>
            <p>You don&apos;t have any notifications right now.</p>
          </div>
        ) : (
          notifications.map(notification => (
            <Link 
              key={notification.id} 
              href={notification.linkUrl || '#'} 
              className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
            >
              <div className="notification-icon">
                <span className="material-symbols-outlined">{getIconForType(notification.type)}</span>
              </div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.body}</div>
                <div className="notification-time">{new Date(notification.createdAt).toLocaleDateString()}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
