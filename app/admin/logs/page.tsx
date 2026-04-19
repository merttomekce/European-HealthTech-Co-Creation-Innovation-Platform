import React from 'react';
import { getAdminLogs } from '@/lib/actions/admin';
import AdminLogsClient from './AdminLogsClient';

export default async function AdminLogsPage() {
  const result = await getAdminLogs();

  if (!result.success) {
    return <div>Error loading logs: {result.error}</div>;
  }

  return <AdminLogsClient initialLogs={result.logs as any} />;
}
