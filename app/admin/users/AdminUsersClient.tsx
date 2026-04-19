'use client';

import React, { useState } from 'react';
import { adminSuspendUser } from '@/lib/actions/admin';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  institution: string | null;
  city: string | null;
  createdAt: string | Date;
  isSuspended: boolean;
  expertise: string[];
}

export default function AdminUsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [filter, setFilter] = useState<'All' | 'Healthcare Pro' | 'Engineer' | 'Suspended'>('All');
  const [isLoading, setIsLoading] = useState(false);

  const toggleStatus = async (id: string, currentlySuspended: boolean) => {
    if (!confirm(`Are you sure you want to ${currentlySuspended ? 'reactivate' : 'suspend'} this user?`)) return;
    
    setIsLoading(true);
    const res = await adminSuspendUser(id, !currentlySuspended);
    if (res.success) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isSuspended: !currentlySuspended } : u));
    } else {
      alert('Failed to update user status');
    }
    setIsLoading(false);
  };

  const filtered = users.filter(u => {
    if (filter === 'All') return true;
    if (filter === 'Suspended') return u.isSuspended;
    if (filter === 'Healthcare Pro') return u.role === 'HEALTHCARE_PROFESSIONAL';
    if (filter === 'Engineer') return u.role === 'ENGINEER';
    return true;
  });

  const getProfileCompleteness = (user: User) => {
    let score = 0;
    if (user.name) score += 20;
    if (user.institution) score += 20;
    if (user.city) score += 20;
    if (user.expertise && user.expertise.length > 0) score += 40;
    return score;
  };

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">User Management</h1>
        <p className="admin-page-subtitle">{users.length} registered users &mdash; {users.filter(u => u.isSuspended).length} suspended.</p>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <span className="table-toolbar-title">All Users</span>
          <div className="table-toolbar-actions">
            {(['All', 'Healthcare Pro', 'Engineer', 'Suspended'] as const).map(f => (
              <button
                key={f}
                className="table-btn"
                onClick={() => setFilter(f)}
                style={{ 
                  borderColor: filter === f ? 'rgba(239,68,68,0.5)' : undefined, 
                  color: filter === f ? '#ef4444' : undefined,
                  opacity: isLoading ? 0.5 : 1
                }}
                disabled={isLoading}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>User Info</th>
              <th>Role</th>
              <th>Institution / City</th>
              <th>Completeness</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{user.name || 'Unnamed User'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-background-muted)' }}>{user.email}</div>
                </td>
                <td>
                  <span className="status-pill" style={{ 
                    background: user.role === 'HEALTHCARE_PROFESSIONAL' ? 'rgba(168,85,247,0.1)' : 'rgba(59,130,246,0.1)', 
                    color: user.role === 'HEALTHCARE_PROFESSIONAL' ? '#a855f7' : '#3b82f6' 
                  }}>
                    {user.role.replace(/_/g, ' ')}
                  </span>
                </td>
                <td style={{ color: 'var(--on-background-muted)' }}>
                  <div>{user.institution || 'N/A'}</div>
                  <div style={{ fontSize: '0.75rem' }}>{user.city || 'Unknown City'}</div>
                </td>
                <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: 4, background: 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${getProfileCompleteness(user)}%`, height: '100%', background: '#22c55e' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{getProfileCompleteness(user)}%</span>
                    </div>
                </td>
                <td style={{ color: 'var(--on-background-muted)', fontSize: '0.8125rem' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <span className={`status-pill ${user.isSuspended ? 'suspended' : 'active'}`}>
                    {user.isSuspended ? 'Suspended' : 'Active'}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className={`icon-btn ${!user.isSuspended ? 'danger' : ''}`}
                      title={!user.isSuspended ? 'Suspend User' : 'Reactivate User'}
                      onClick={() => toggleStatus(user.id, user.isSuspended)}
                      disabled={isLoading}
                    >
                      <span className="material-symbols-outlined">
                        {user.isSuspended ? 'check_circle' : 'block'}
                      </span>
                    </button>
                    <a href={`/profile/${user.id}`} target="_blank" className="icon-btn" title="View Profile">
                      <span className="material-symbols-outlined">open_in_new</span>
                    </a>
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
