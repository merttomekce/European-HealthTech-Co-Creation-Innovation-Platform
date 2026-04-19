'use client';

import React, { useState } from 'react';
import { exportLogsCsv } from '@/lib/actions/admin';

interface Log {
  id: string;
  userId: string | null;
  user: { name: string | null, email: string } | null;
  actionType: string;
  targetEntity: string | null;
  result: string;
  createdAt: string | Date;
}

export default function AdminLogsClient({ initialLogs }: { initialLogs: Log[] }) {
  const [logs, setLogs] = useState<Log[]>(initialLogs);
  const [filters, setFilters] = useState({
      userId: '',
      actionType: 'All'
  });
  const [isExporting, setIsExporting] = useState(false);

  const filtered = logs.filter(l => {
      const matchUser = !filters.userId || l.user?.email.toLowerCase().includes(filters.userId.toLowerCase());
      const matchAction = filters.actionType === 'All' || l.actionType === filters.actionType;
      return matchUser && matchAction;
  });

  const handleExport = async () => {
    setIsExporting(true);
    const res = await exportLogsCsv();
    if (res.success && res.csv) {
      const blob = new Blob([res.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `audit_logs_${new Date().toISOString()}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert('Export failed');
    }
    setIsExporting(false);
  };

  const actionTypes = Array.from(new Set(initialLogs.map(l => l.actionType))).sort();

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Audit Logs</h1>
        <p className="admin-page-subtitle">Track all platform events and security actions.</p>
      </div>

      <div className="table-container">
        <div className="table-toolbar" style={{ flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="table-toolbar-title">Event Log</span>
            <button 
                className="table-btn primary" 
                onClick={handleExport}
                disabled={isExporting}
                style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>download</span>
                {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
                <input 
                    type="text" 
                    placeholder="Search by user email..." 
                    className="admin-filter-input"
                    value={filters.userId}
                    onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
                />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
                <select 
                    className="admin-filter-input"
                    value={filters.actionType}
                    onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value }))}
                >
                    <option value="All">All Event Types</option>
                    {actionTypes.map(t => (
                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                </select>
            </div>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Target Entity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id}>
                <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleString()}
                </td>
                <td>
                    <div style={{ fontWeight: 500 }}>{log.user?.email || 'System'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-background-muted)' }}>{log.user?.name || ''}</div>
                </td>
                <td>
                    <span style={{ 
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(0,0,0,0.05)'
                    }}>
                        {log.actionType.replace(/_/g, ' ')}
                    </span>
                </td>
                <td style={{ color: 'var(--on-background-muted)', fontSize: '0.8125rem' }}>
                    {log.targetEntity || '-'}
                </td>
                <td>
                  <span className={`status-pill ${log.result === 'success' ? 'active' : 'suspended'}`}>
                    {log.result}
                  </span>
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
    </>
  );
}
