import React from 'react';
import { getMySentRequests } from '@/lib/actions/meetings';
import MyRequestsClient from './MyRequestsClient';
import { redirect } from 'next/navigation';

export default async function MyRequestsPage() {
  const result = await getMySentRequests();

  if (!result.success) {
    if (result.error === 'Unauthorized') redirect('/');
    return <div>Error loading requests</div>;
  }

  // The 'data' will be an array of MeetingRequest objects 
  // with joined 'announcement' and 'proposedSlots'
  const myRequests = result.data || [];

  return <MyRequestsClient initialRequests={myRequests} />;
}
