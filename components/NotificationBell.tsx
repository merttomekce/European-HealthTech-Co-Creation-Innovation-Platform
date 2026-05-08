'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { getUnreadCount } from '@/lib/actions/notifications';

export default function NotificationBell() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    async function load() {
      const count = await getUnreadCount();
      setUnreadCount(count);
    }
    load();

    window.addEventListener('notifications-updated', load);
    return () => window.removeEventListener('notifications-updated', load);
  }, []);

  return (
    <Link 
      href="/notifications" 
      className={`island-item ${pathname.startsWith('/notifications') ? 'active' : ''}`}
      aria-label="Notifications" 
      title="Notifications"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="notification-badge"></span>
      )}
    </Link>
  );
}

