'use client';

import React from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { getUnreadCount } from '@/lib/actions/notifications';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    async function load() {
      const count = await getUnreadCount();
      setUnreadCount(count);
    }
    load();
  }, []);

  return (
    <Link href="/notifications" className="notification-btn" aria-label="Notifications">
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="notification-badge"></span>
      )}
    </Link>
  );
}
