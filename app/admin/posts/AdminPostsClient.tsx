'use client';

import React, { useState } from 'react';
import { toggleAnnouncementStatus } from '@/lib/actions/announcements';

export default function AdminPostsClient({ initialPosts }: { initialPosts: any[] }) {
  const [announcements, setAnnouncements] = useState(initialPosts);
  const [filter, setFilter] = useState<'All' | 'ACTIVE' | 'CLOSED' | 'EXPIRED'>('All');

  const filtered = announcements.filter(a => filter === 'All' || a.status === filter);

  const forceRemove = async (id: string) => {
    if (confirm('Remove this announcement? This action cannot be undone.')) {
      const res = await toggleAnnouncementStatus(id, 'EXPIRED');
      if (res.success) {
        setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, status: 'EXPIRED' } : a));
      }
    }
  };

  const statusMap: Record<string, string> = {
    ACTIVE: 'open',
    CLOSED: 'closed',
    EXPIRED: 'closed',
    DRAFT: 'pending',
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
            {(['All', 'ACTIVE', 'CLOSED', 'EXPIRED'] as const).map(f => (
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
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(post => (
              <tr key={post.id}>
                <td>
                  <div style={{ fontWeight: 500, maxWidth: '320px', lineHeight: 1.4 }}>{post.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-background-muted)', marginTop: '0.125rem' }}>by {post.author?.name || 'Unknown'}</div>
                </td>
                <td>
                  <span style={{ color: '#3b82f6', fontSize: '0.8125rem', fontWeight: 600 }}>{post.domain}</span>
                </td>
                <td style={{ color: 'var(--on-background-muted)', fontSize: '0.8125rem' }}>{post.city}</td>
                <td>
                  <span className={`status-pill ${statusMap[post.status] || 'closed'}`}>
                    {post.status}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn danger" title="Force Remove" aria-label={`Force remove announcement ${post.title}`} onClick={() => forceRemove(post.id)}>
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                    <button className="icon-btn" title="View Post" aria-label={`View announcement ${post.title}`}>
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
