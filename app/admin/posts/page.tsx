import React from 'react';
import { getAdminPosts } from '@/lib/actions/admin';
import AdminPostsClient from './AdminPostsClient';

export default async function AdminPostsPage() {
  const result = await getAdminPosts();
  const posts = result.success && result.posts ? result.posts : [];

  return <AdminPostsClient initialPosts={posts || []} />;
}
