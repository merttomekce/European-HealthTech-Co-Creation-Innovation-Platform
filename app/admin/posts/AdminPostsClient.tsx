'use client';

import React, { useState } from 'react';
import { adminRemovePost, getPostLifecycle } from '@/lib/actions/admin';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  domain: string;
  city: string;
  status: string;
  createdAt: string | Date;
  author: {
      name: string | null;
      email: string;
  } | null;
}

export default function AdminPostsClient({ initialPosts }: { initialPosts: Post[] }) {
  const [announcements, setAnnouncements] = useState<Post[]>(initialPosts);
  const [filters, setFilters] = useState({
      status: 'All',
      domain: '',
      city: ''
  });
  const [selectedLogs, setSelectedLogs] = useState<any[] | null>(null);
  const [selectedPostTitle, setSelectedPostTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filtered = announcements.filter(a => {
      const matchStatus = filters.status === 'All' || a.status === filters.status;
      const matchDomain = !filters.domain || a.domain.toLowerCase().includes(filters.domain.toLowerCase());
      const matchCity = !filters.city || a.city.toLowerCase().includes(filters.city.toLowerCase());
      return matchStatus && matchDomain && matchCity;
  });

  const forceRemove = async (id: string) => {
    const reason = prompt('Reason for removal (will be logged):');
    if (reason === null) return;
    
    if (confirm('Remove this announcement? This action cannot be undone.')) {
      setIsLoading(true);
      const res = await adminRemovePost(id, reason || 'No reason provided');
      if (res.success) {
        setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, status: 'ARCHIVED' } : a));
      } else {
        alert('Failed to remove post');
      }
      setIsLoading(false);
    }
  };

  const handleViewLifecycle = async (postId: string, title: string) => {
    setIsLoading(true);
    const res = await getPostLifecycle(postId);
    if (res.success) {
      setSelectedLogs(res.logs || []);
      setSelectedPostTitle(title);
    } else {
      alert('Failed to load lifecycle history');
    }
    setIsLoading(false);
  };

  const statusMap: Record<string, string> = {
    ACTIVE: 'open',
    PARTNER_FOUND: 'active',
    MEETING_SCHEDULED: 'negotiation',
    EXPIRED: 'closed',
    ARCHIVED: 'closed',
    DRAFT: 'pending',
  };

  const domains = Array.from(new Set(initialPosts.map(p => p.domain))).sort();
  const cities = Array.from(new Set(initialPosts.map(p => p.city))).sort();

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Announcement Management</h1>
        <p className="admin-page-subtitle">{announcements.length} total posts across the platform.</p>
      </div>

      <div className="table-container">
        <div className="table-toolbar" style={{ flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="table-toolbar-title">All Announcements</span>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-background-muted)', marginBottom: '0.25rem', display: 'block' }}>Search Domain</label>
                <input 
                    type="text" 
                    placeholder="Filter by domain..." 
                    className="admin-filter-input"
                    value={filters.domain}
                    onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value }))}
                />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-background-muted)', marginBottom: '0.25rem', display: 'block' }}>Search City</label>
                <input 
                    type="text" 
                    placeholder="Filter by city..." 
                    className="admin-filter-input"
                    value={filters.city}
                    onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-background-muted)', marginBottom: '0.25rem', display: 'block' }}>Status</label>
                <select 
                    className="admin-filter-input"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                    <option value="All">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PARTNER_FOUND">Partner Found</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="ARCHIVED">Archived</option>
                </select>
            </div>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Title / Author</th>
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
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-background-muted)', marginTop: '0.125rem' }}>
                      by {post.author?.name || 'Unknown'} ({post.author?.email})
                  </div>
                </td>
                <td>
                  <span style={{ color: '#3b82f6', fontSize: '0.8125rem', fontWeight: 600 }}>{post.domain}</span>
                </td>
                <td style={{ color: 'var(--on-background-muted)', fontSize: '0.8125rem' }}>{post.city}</td>
                <td>
                  <span className={`status-pill ${statusMap[post.status] || 'closed'}`}>
                    {post.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button 
                      className="icon-btn" 
                      title="View Lifecycle" 
                      onClick={() => handleViewLifecycle(post.id, post.title)}
                    >
                      <span className="material-symbols-outlined">history</span>
                    </button>
                    {post.status !== 'ARCHIVED' && (
                        <button className="icon-btn danger" title="Remove Post" onClick={() => forceRemove(post.id)} disabled={isLoading}>
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                    )}
                    <Link href={`/board/${post.id}`} target="_blank" className="icon-btn" title="View Post">
                      <span className="material-symbols-outlined">open_in_new</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .admin-filter-input {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            border: 1px solid rgba(0,0,0,0.1);
            font-size: 0.8125rem;
            outline: none;
            background: white;
        }
        .admin-filter-input:focus {
            border-color: #ef4444;
            box-shadow: 0 0 0 2px rgba(239,68,68,0.1);
        }
      `}</style>

      {selectedLogs && (
        <div className="admin-modal-overlay" onClick={() => setSelectedLogs(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Lifecycle History: {selectedPostTitle}</h2>
              <button className="icon-btn" onClick={() => setSelectedLogs(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal-content">
              {selectedLogs.length > 0 ? (
                <div className="lifecycle-timeline">
                  {selectedLogs.map((log) => (
                    <div key={log.id} className="timeline-item">
                      <div className="timeline-marker" />
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-action">{log.actionType.replace(/_/g, ' ')}</span>
                          <span className="timeline-date">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="timeline-actor">by {log.user?.email || 'System'}</div>
                        {log.metadata && (
                          <div className="timeline-meta">
                            {typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-background-muted)' }}>
                  No history found for this post.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
        }
        .admin-modal {
            background: var(--surface-container);
            border: 1px solid var(--outline);
            border-radius: 16px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        .admin-modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--outline);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .admin-modal-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
        }
        .admin-modal-content {
            padding: 1.5rem;
            overflow-y: auto;
        }
        .lifecycle-timeline {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            position: relative;
        }
        .lifecycle-timeline::before {
            content: '';
            position: absolute;
            left: 7px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--outline);
        }
        .timeline-item {
            display: flex;
            gap: 1.5rem;
            position: relative;
        }
        .timeline-marker {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #ef4444;
            border: 4px solid var(--surface-container);
            flex-shrink: 0;
            z-index: 1;
        }
        .timeline-content {
            flex: 1;
        }
        .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.25rem;
        }
        .timeline-action {
            font-weight: 600;
            font-size: 0.875rem;
            color: var(--on-background);
        }
        .timeline-date {
            font-size: 0.75rem;
            color: var(--on-background-muted);
        }
        .timeline-actor {
            font-size: 0.8125rem;
            color: var(--on-background-muted);
        }
        .timeline-meta {
            margin-top: 0.5rem;
            padding: 0.5rem;
            background: rgba(0,0,0,0.05);
            border-radius: 4px;
            font-size: 0.75rem;
            font-family: monospace;
            word-break: break-all;
        }
      `}</style>
    </>
  );
}
