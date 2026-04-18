import React from 'react';
import { getNotifications } from '@/lib/actions/notifications';
import NotificationsClient from './NotificationsClient';
import { redirect } from 'next/navigation';

export default async function NotificationsPage() {
  const result = await getNotifications();

  if (!result.success) {
    if (result.error === 'Unauthorized') redirect('/');
    return <div>Error loading notifications</div>;
  }

  return <NotificationsClient initialData={result.data || []} />;
}
