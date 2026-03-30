'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/StoreContext';

export default function AdminPostsPage() {
  const { announcements, updateAnnouncementStatus } = useStore();
  const [filter, setFilter] = useState<'All' | 'Active' | 'Closed' | 'Expired'>('All');

  const filtered = announcements.filter(a => filter === 'All' || a.status === filter);

  const forceRemove = (id: string) => {
    if (confirm('Remove this announcement? This action cannot be undone.')) {
      updateAnnouncementStatus(id, 'Expired');
    }
  };

  const statusMap: Record<string, string> = {
    Active: 'open',
    Closed: 'closed',
    Expired: 'closed',
    Draft: 'pending',
  };

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Announcement Management</h1>
        <p className="admin-page-subtitle">{announcements.length} total posts across the platform.</p>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <span className="table-toolbar-title">All Announcements</span>
          <div className="table-toolbar-actions">
            {(['All', 'Active', 'Closed', 'Expired'] as const).map(f => (
              <button
                key={f}
                className="table-btn"
                onClick={() => setFilter(f)}
                style={{ borderColor: filter === f ? 'rgba(239,68,68,0.5)' : undefined, color: filter === f ? '#ef4444' : undefined }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Domain</th>
              <th>City</th>
              <th>Stage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(post => (
              <tr key={post.id}>
                <td>
                  <div style={{ fontWeight: 500, maxWidth: '320px', lineHeight: 1.4 }}>{post.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-background-muted)', marginTop: '0.125rem' }}>by {post.author}</div>
                </td>
                <td>
                  <span style={{ color: '#3b82f6', fontSize: '0.8125rem', fontWeight: 600 }}>{post.domain}</span>
                </td>
                <td style={{ color: 'var(--on-background-muted)', fontSize: '0.8125rem' }}>{post.location}</td>
                <td style={{ color: 'var(--on-background-muted)', fontSize: '0.8125rem' }}>{post.projectStage || '—'}</td>
                <td>
                  <span className={`status-pill ${statusMap[post.status] || 'closed'}`}>
                    {post.status}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn danger" title="Force Remove" onClick={() => forceRemove(post.id)}>
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                    <button className="icon-btn" title="View Post">
                      <span className="material-symbols-outlined">open_in_new</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
