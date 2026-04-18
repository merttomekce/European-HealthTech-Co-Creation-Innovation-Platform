import React from 'react';
import { getAnnouncements } from '@/lib/actions/announcements';
import AdminPostsClient from './AdminPostsClient';

export default async function AdminPostsPage() {
  const result = await getAnnouncements();
  const posts = result.success ? result.data : [];

  return <AdminPostsClient initialPosts={posts || []} />;
}
