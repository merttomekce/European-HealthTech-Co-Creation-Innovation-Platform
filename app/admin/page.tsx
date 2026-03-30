'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/StoreContext';

export default function AdminDashboardPage() {
  const { announcements, interests, meetings } = useStore();

  const kpis = [
    { label: 'Total Users', value: 142, delta: '+12', type: 'positive', icon: 'group' },
    { label: 'Active Announcements', value: announcements.filter(a => a.status === 'Active').length, delta: '+3', type: 'positive', icon: 'campaign' },
    { label: 'Meetings This Week', value: meetings.length + 4, delta: '+6', type: 'positive', icon: 'event' },
    { label: 'Partner Found Rate', value: '34%', delta: '+2%', type: 'positive', icon: 'handshake' },
    { label: 'Pending Requests', value: interests.filter(i => i.status === 'Pending').length, delta: '-1', type: 'neutral', icon: 'pending' },
    { label: 'Suspended Users', value: 2, delta: '0', type: 'neutral', icon: 'block' },
  ];

  const recentActivity = [
    { id: 1, event: 'New user registered', actor: 'amira.hassan@tu-berlin.de', time: '3 min ago', type: 'create' },
    { id: 2, event: 'Announcement flagged for review', actor: 'System', time: '18 min ago', type: 'system' },
    { id: 3, event: 'Partner match confirmed', actor: 'platform', time: '1 hour ago', type: 'create' },
    { id: 4, event: 'User account suspended', actor: 'admin@healthai.eu', time: '2 hours ago', type: 'delete' },
    { id: 5, event: 'New announcement posted', actor: 'dr.chen@charite.de', time: '3 hours ago', type: 'create' },
  ];

  const typeColors: Record<string, string> = {
    create: '#22c55e',
    delete: '#ef4444',
    system: 'var(--on-background-muted)',
    update: '#3b82f6',
  };

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Platform Overview</h1>
        <p className="admin-page-subtitle">Real-time KPIs and platform health metrics.</p>
      </div>

      <div className="admin-kpi-grid">
        {kpis.map(kpi => (
          <div key={kpi.label} className="admin-kpi-card">
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: 'var(--on-background-muted)', opacity: 0.5 }}>{kpi.icon}</span>
            <div className="admin-kpi-value">{kpi.value}</div>
            <div className="admin-kpi-label">{kpi.label}</div>
            <div className={`admin-kpi-delta ${kpi.type}`}>{kpi.delta} this week</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Activity */}
        <div className="table-container">
          <div className="table-toolbar">
            <span className="table-toolbar-title">Recent Activity</span>
            <Link href="/admin/logs" className="table-btn" style={{ textDecoration: 'none' }}>
              View All →
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
              {recentActivity.map(item => (
                <tr key={item.id}>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: typeColors[item.type], flexShrink: 0 }} />
                      {item.event}
                    </span>
                  </td>
                  <td style={{ color: 'var(--on-background-muted)', fontSize: '0.8125rem' }}>{item.actor}</td>
                  <td style={{ color: 'var(--on-background-muted)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Domain Distribution */}
        <div className="table-container">
          <div className="table-toolbar">
            <span className="table-toolbar-title">Top Domains</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Domain</th>
                <th>Posts</th>
                <th>Match Rate</th>
              </tr>
            </thead>
            <tbody>
              {[
                { domain: 'Cardiology', posts: 18, rate: '41%' },
                { domain: 'Neurosurgery', posts: 14, rate: '35%' },
                { domain: 'Biotech', posts: 11, rate: '29%' },
                { domain: 'Radiology', posts: 8, rate: '22%' },
                { domain: 'Orthopedics', posts: 5, rate: '18%' },
              ].map(row => (
                <tr key={row.domain}>
                  <td>{row.domain}</td>
                  <td style={{ color: 'var(--on-background-muted)' }}>{row.posts}</td>
                  <td>
                    <span style={{ color: '#22c55e', fontWeight: 600 }}>{row.rate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
