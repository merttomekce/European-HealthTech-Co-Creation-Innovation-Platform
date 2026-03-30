'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function useRealtime(userId?: string) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 1. Subscribe to Global Announcements
    const announcementChannel = supabase
      .channel('announcements-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'Announcement',
        },
        () => {
          // Revalidate current page to show new data
          router.refresh();
        }
      )
      .subscribe();

    // 2. Subscribe to Personal Notifications (if user is logged in)
    let notificationChannel: any;
    if (userId) {
      notificationChannel = supabase
        .channel(`user-notifications-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'Notification',
            filter: `userId=eq.${userId}`,
          },
          (payload) => {
            console.log('New notification received!', payload);
            // Refresh to update notification counter/list
            router.refresh();
            
            // Optional: Trigger browser notification or custom UI toast here
            if ('Notification' in window && window.Notification.permission === 'granted') {
              new window.Notification(payload.new.title, {
                body: payload.new.body,
              });
            }
          }
        )
        .subscribe();
    }

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(announcementChannel);
      if (notificationChannel) {
        supabase.removeChannel(notificationChannel);
      }
    };
  }, [userId, router, supabase]);
}
