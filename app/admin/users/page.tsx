'use client';

import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Healthcare Pro' | 'Engineer';
  institution: string;
  city: string;
  joined: string;
  status: 'Active' | 'Suspended';
}

const mockUsers: User[] = [
  { id: 'u1', name: 'Dr. Sarah Chen', email: 'sarah.chen@charite.de', role: 'Healthcare Pro', institution: 'Berlin Charité', city: 'Berlin', joined: '12 Jan 2026', status: 'Active' },
  { id: 'u2', name: 'Elena Rodriguez', email: 'e.rodriguez@eth.ch', role: 'Engineer', institution: 'ETH Zurich', city: 'Zurich', joined: '18 Jan 2026', status: 'Active' },
  { id: 'u3', name: 'Dr. James Okonkwo', email: 'j.okonkwo@uniklinik.de', role: 'Healthcare Pro', institution: 'Uniklinikum', city: 'Frankfurt', joined: '2 Feb 2026', status: 'Active' },
  { id: 'u4', name: 'Amira Hassan', email: 'a.hassan@tu-berlin.de', role: 'Engineer', institution: 'TU Berlin', city: 'Berlin', joined: '14 Feb 2026', status: 'Active' },
  { id: 'u5', name: 'Dr. Lars Eriksson', email: 'l.eriksson@ki.se', role: 'Healthcare Pro', institution: 'Karolinska', city: 'Stockholm', joined: '28 Feb 2026', status: 'Suspended' },
  { id: 'u6', name: 'Priya Sharma', email: 'p.sharma@imperial.ac.uk', role: 'Engineer', institution: 'Imperial College', city: 'London', joined: '3 Mar 2026', status: 'Active' },
  { id: 'u7', name: 'Dr. Marco Ferrari', email: 'm.ferrari@humanitas.it', role: 'Healthcare Pro', institution: 'Humanitas', city: 'Milan', joined: '11 Mar 2026', status: 'Suspended' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filter, setFilter] = useState<'All' | 'Healthcare Pro' | 'Engineer' | 'Suspended'>('All');

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
  };

  const filtered = users.filter(u => {
    if (filter === 'All') return true;
    if (filter === 'Suspended') return u.status === 'Suspended';
    return u.role === filter;
  });

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">User Management</h1>
        <p className="admin-page-subtitle">{users.length} registered users &mdash; {users.filter(u => u.status === 'Suspended').length} suspended.</p>
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
              <th>Name</th>
              <th>Role</th>
              <th>Institution</th>
              <th>City</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-background-muted)' }}>{user.email}</div>
                </td>
                <td>
                  <span className="status-pill" style={{ background: user.role === 'Healthcare Pro' ? 'rgba(168,85,247,0.1)' : 'rgba(59,130,246,0.1)', color: user.role === 'Healthcare Pro' ? '#a855f7' : '#3b82f6' }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ color: 'var(--on-background-muted)' }}>{user.institution}</td>
                <td style={{ color: 'var(--on-background-muted)' }}>{user.city}</td>
                <td style={{ color: 'var(--on-background-muted)', fontSize: '0.8125rem' }}>{user.joined}</td>
                <td>
                  <span className={`status-pill ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className={`icon-btn ${user.status === 'Active' ? 'danger' : ''}`}
                      title={user.status === 'Active' ? 'Suspend User' : 'Reactivate User'}
                      onClick={() => toggleStatus(user.id)}
                      aria-label={`${user.status === 'Active' ? 'Suspend' : 'Reactivate'} ${user.name}`}
                    >
                      <span className="material-symbols-outlined">
                        {user.status === 'Active' ? 'block' : 'check_circle'}
                      </span>
                    </button>
                    <button className="icon-btn" title="View Profile" aria-label={`View profile for ${user.name}`}>
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
