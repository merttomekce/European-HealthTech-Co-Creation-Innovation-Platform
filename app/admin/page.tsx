import React from 'react';
import Link from 'next/link';
import { getAdminDashboardStats } from '@/lib/actions/admin';

export default async function AdminDashboardPage() {
  const result = await getAdminDashboardStats();

  if (!result.success) {
    return (
      <div className="error-container">
        <h1>Error loading dashboard</h1>
        <p>{result.error}</p>
      </div>
    );
  }

  const { stats, recentLogs } = result;

  const kpiData = [
    { label: 'Total Users', value: stats.totalUsers, icon: 'group' },
    { label: 'Active Announcements', value: stats.activePosts, icon: 'campaign' },
    { label: 'Meetings Confirmed', value: stats.totalMeetings, icon: 'event' },
    { label: 'Partner Found Rate', value: stats.matchRate, icon: 'handshake' },
    { label: 'Suspended Users', value: stats.suspendedUsers, icon: 'block' },
  ];

  const typeColors: Record<string, string> = {
    LOGIN: '#3b82f6',
    POST_CREATED: '#22c55e',
    POST_REMOVED_BY_ADMIN: '#ef4444',
    MEETING_REQUEST_SENT: '#a855f7',
    default: 'var(--on-background-muted)',
  };

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Platform Overview</h1>
        <p className="admin-page-subtitle">Real-time KPIs and platform health metrics.</p>
      </div>

      <div className="admin-kpi-grid">
        {kpiData.map(kpi => (
          <div key={kpi.label} className="admin-kpi-card">
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: 'var(--on-background-muted)', opacity: 0.5 }}>{kpi.icon}</span>
            <div className="admin-kpi-value">{kpi.value}</div>
            <div className="admin-kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div className="table-container">
          <div className="table-toolbar">
            <span className="table-toolbar-title">Recent Activity Logs</span>
            <Link href="/admin/logs" className="table-btn" style={{ textDecoration: 'none' }}>
              View All Logs →
            </Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Actor</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs && recentLogs.length > 0 ? (
                recentLogs.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          backgroundColor: typeColors[item.event] || typeColors.default, 
                          flexShrink: 0 
                        }} />
                        {item.event.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ color: 'var(--on-background-muted)', fontSize: '0.8125rem' }}>{item.actor}</td>
                    <td style={{ color: 'var(--on-background-muted)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {new Date(item.time).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-background-muted)' }}>
                    No recent activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
