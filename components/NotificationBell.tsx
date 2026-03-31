'use client';

import React from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-animated';
import { useStore } from '@/lib/StoreContext';

const DEMO_USER_ID = 'user-current';

export default function NotificationBell() {
  const { notifications } = useStore();
  const unreadCount = notifications.filter(n => n.userId === DEMO_USER_ID && !n.isRead).length;

  return (
    <Link href="/notifications" className="notification-btn" aria-label="Notifications">
      <Bell size={20} animate="hover" />
      {unreadCount > 0 && (
        <span className="notification-badge"></span>
      )}
    </Link>
  );
}
