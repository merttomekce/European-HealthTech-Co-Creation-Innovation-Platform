'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/StoreContext';

// We assume there's a global current user ID for this demo
const DEMO_USER_ID = 'user-current';

export default function NotificationBell() {
  const { notifications } = useStore();
  
  // Count unread notifications for the current user
  const unreadCount = notifications.filter(n => n.userId === DEMO_USER_ID && !n.isRead).length;

  return (
    <Link href="/notifications" className="notification-btn" aria-label="Notifications">
      <span className="material-symbols-outlined">notifications</span>
      {unreadCount > 0 && (
        <span className="notification-badge"></span>
      )}
    </Link>
  );
}
