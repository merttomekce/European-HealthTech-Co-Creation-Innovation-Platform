import React from 'react';
import { getMyAnnouncements } from '@/lib/actions/announcements';
import MyAnnouncementsClient from './MyAnnouncementsClient';
import { redirect } from 'next/navigation';

export default async function MyAnnouncementsPage() {
  const result = await getMyAnnouncements();

  if (!result.success) {
    if (result.error === 'Unauthorized') redirect('/');
    return <div>Error loading announcements</div>;
  }

  return <MyAnnouncementsClient initialData={result.data || []} />;
}
