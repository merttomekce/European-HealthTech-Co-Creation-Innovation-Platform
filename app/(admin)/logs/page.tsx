'use client';

import React from 'react';

const auditLogs = [
  { id: 1, ts: '2026-03-29 17:04:12', user: 'dr.chen@charite.de', role: 'Healthcare Pro', action: 'POST_CREATED', target: 'ann-0012', result: 'OK', ip: '185.92.10.44' },
  { id: 2, ts: '2026-03-29 16:51:08', user: 'a.hassan@tu-berlin.de', role: 'Engineer', action: 'INTEREST_SUBMITTED', target: 'ann-0012', result: 'OK', ip: '91.64.33.12' },
  { id: 3, ts: '2026-03-29 16:29:44', user: 'admin@healthai.eu', role: 'Admin', action: 'USER_SUSPENDED', target: 'u7', result: 'OK', ip: '10.0.0.1' },
  { id: 4, ts: '2026-03-29 15:40:02', user: 'l.eriksson@ki.se', role: 'Healthcare Pro', action: 'LOGIN_FAILED', target: '—', result: 'ERR', ip: '87.206.44.11' },
  { id: 5, ts: '2026-03-29 15:39:47', user: 'l.eriksson@ki.se', role: 'Healthcare Pro', action: 'LOGIN_FAILED', target: '—', result: 'ERR', ip: '87.206.44.11' },
  { id: 6, ts: '2026-03-29 15:32:21', user: 'p.sharma@imperial.ac.uk', role: 'Engineer', action: 'PROFILE_UPDATED', target: 'u6', result: 'OK', ip: '82.11.9.222' },
  { id: 7, ts: '2026-03-29 14:18:59', user: 'e.rodriguez@eth.ch', role: 'Engineer', action: 'MEETING_CONFIRMED', target: 'mtg-003', result: 'OK', ip: '195.176.2.99' },
  { id: 8, ts: '2026-03-29 13:07:33', user: 'system', role: 'System', action: 'POST_EXPIRED', target: 'ann-0008', result: 'OK', ip: '—' },
  { id: 9, ts: '2026-03-29 12:44:01', user: 'j.okonkwo@uniklinik.de', role: 'Healthcare Pro', action: 'POST_DELETED', target: 'ann-0010', result: 'OK', ip: '88.99.14.67' },
  { id: 10, ts: '2026-03-29 11:02:15', user: 'amira.hassan@tu-berlin.de', role: 'Engineer', action: 'USER_REGISTERED', target: 'u4', result: 'OK', ip: '91.64.33.12' },
];

const actionClass = (action: string) => {
  if (action.includes('CREATED') || action.includes('CONFIRMED') || action.includes('REGISTERED')) return 'create';
  if (action.includes('DELETED') || action.includes('SUSPENDED')) return 'delete';
  if (action.includes('UPDATED') || action.includes('SUBMITTED')) return 'update';
  if (action.includes('LOGIN')) return 'failed';
  if (action.includes('EXPIRED')) return 'system';
  return 'system';
};

export default function AdminLogsPage() {
  const isAnomaly = (log: typeof auditLogs[0]) => log.action === 'LOGIN_FAILED' && log.result === 'ERR';

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'User', 'Role', 'Action', 'Target', 'Result', 'IP'].join(','),
      ...auditLogs.map(l => [l.ts, l.user, l.role, l.action, l.target, l.result, l.ip].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Audit Logs</h1>
        <p className="admin-page-subtitle">A tamper-evident record of all platform events. Anomalies are highlighted.</p>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <span className="table-toolbar-title">System Event Log</span>
          <div className="table-toolbar-actions">
            <button className="table-btn" onClick={handleExport}>
              <span className="material-symbols-outlined">download</span>
              Export CSV
            </button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Role</th>
              <th>Action</th>
              <th>Target</th>
              <th>Result</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map(log => (
              <tr key={log.id} style={isAnomaly(log) ? { backgroundColor: 'rgba(239,68,68,0.05)' } : {}}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--on-background-muted)', whiteSpace: 'nowrap' }}>
                  {isAnomaly(log) && (
                    <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', color: '#ef4444', verticalAlign: 'middle', marginRight: '0.375rem' }}>warning</span>
                  )}
                  {log.ts}
                </td>
                <td style={{ fontSize: '0.8125rem' }}>{log.user}</td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--on-background-muted)' }}>{log.role}</td>
                <td>
                  <span className={`log-action-pill ${actionClass(log.action)}`}>{log.action}</span>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--on-background-muted)' }}>{log.target}</td>
                <td>
                  <span style={{ fontWeight: 600, color: log.result === 'OK' ? '#22c55e' : '#ef4444', fontSize: '0.8125rem' }}>{log.result}</span>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--on-background-muted)' }}>{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
