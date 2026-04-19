import React from 'react';
import { getAdminUsers } from '@/lib/actions/admin';
import AdminUsersClient from './AdminUsersClient';

export default async function AdminUsersPage() {
  const result = await getAdminUsers();

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  return <AdminUsersClient initialUsers={result.users as any} />;
}
