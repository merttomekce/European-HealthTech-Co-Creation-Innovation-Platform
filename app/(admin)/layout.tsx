'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StoreProvider } from '@/lib/StoreContext';
import './admin.css';

const AdminNavItem = ({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) => (
  <Link href={href} className={`admin-nav-item ${active ? 'active' : ''}`}>
    <span className="material-symbols-outlined">{icon}</span>
    {label}
  </Link>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', icon: 'monitoring', label: 'KPI Dashboard' },
    { href: '/admin/users', icon: 'group', label: 'Users' },
    { href: '/admin/posts', icon: 'article', label: 'Announcements' },
    { href: '/admin/logs', icon: 'history', label: 'Audit Logs' },
    { href: '/admin/settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo-section">
          <div className="admin-logo-text">HealthAI</div>
          <span className="admin-badge">Admin</span>
        </div>
        <div className="admin-divider" />

        <nav className="admin-nav-group">
          <div className="admin-nav-label">Platform</div>
          {navItems.slice(0, 1).map(item => (
            <AdminNavItem key={item.href} {...item} active={pathname === item.href} />
          ))}

          <div className="admin-nav-label">Resources</div>
          {navItems.slice(1, 3).map(item => (
            <AdminNavItem key={item.href} {...item} active={pathname.startsWith(item.href)} />
          ))}

          <div className="admin-nav-label">Governance</div>
          {navItems.slice(3).map(item => (
            <AdminNavItem key={item.href} {...item} active={pathname.startsWith(item.href)} />
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/dashboard" className="admin-nav-item">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Platform
          </Link>
          <div className="admin-divider" />
          <div className="admin-user-section">
            <div className="admin-avatar">PA</div>
            <div>
              <div className="admin-user-name">Platform Admin</div>
              <div className="admin-user-role">ADMIN</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-info">
            <span className="status-dot" />
            Platform Operational
          </div>
        </header>

        <div className="admin-page-content">
          <StoreProvider>
            {children}
          </StoreProvider>
        </div>
      </main>
    </div>
  );
}
