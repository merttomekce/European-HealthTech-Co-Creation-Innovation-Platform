'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StoreProvider } from '@/lib/StoreContext';
import './admin.css';

const AdminNavItem = ({ href, icon, label, active, onClick }: { href: string; icon: string; label: string; active: boolean; onClick?: () => void }) => (
  <Link href={href} className={`admin-nav-item ${active ? 'active' : ''}`} onClick={onClick}>
    <span className="material-symbols-outlined">{icon}</span>
    {label}
  </Link>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { href: '/admin', icon: 'monitoring', label: 'KPI Dashboard' },
    { href: '/admin/users', icon: 'group', label: 'Users' },
    { href: '/admin/posts', icon: 'article', label: 'Announcements' },
    { href: '/admin/logs', icon: 'history', label: 'Audit Logs' },
    { href: '/admin/settings', icon: 'settings', label: 'Settings' },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="admin-shell">
      {isSidebarOpen && <div className="mobile-backdrop" onClick={closeSidebar} style={{ zIndex: 999, position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />}
      
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-logo-section">
          <div className="admin-logo-text">HealthAI</div>
          <span className="admin-badge">Admin</span>
        </div>
        <div className="admin-divider" />

        <nav className="admin-nav-group">
          <div className="admin-nav-label">Platform</div>
          <AdminNavItem 
            href="/admin" 
            icon="monitoring" 
            label="KPI Dashboard" 
            active={pathname === '/admin'} 
            onClick={closeSidebar}
          />

          <div className="admin-nav-label">Resources</div>
          <AdminNavItem 
            href="/admin/users" 
            icon="group" 
            label="Users" 
            active={pathname.startsWith('/admin/users')} 
            onClick={closeSidebar}
          />
          <AdminNavItem 
            href="/admin/posts" 
            icon="article" 
            label="Announcements" 
            active={pathname.startsWith('/admin/posts')} 
            onClick={closeSidebar}
          />

          <div className="admin-nav-label">Governance</div>
          <AdminNavItem 
            href="/admin/logs" 
            icon="history" 
            label="Audit Logs" 
            active={pathname.startsWith('/admin/logs')} 
            onClick={closeSidebar}
          />
          <AdminNavItem 
            href="/admin/settings" 
            icon="settings" 
            label="Settings" 
            active={pathname.startsWith('/admin/settings')} 
            onClick={closeSidebar}
          />
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
          <button 
            className="mobile-menu-btn" 
            onClick={toggleSidebar}
            aria-label="Toggle Menu"
            style={{ 
              display: 'none', 
              marginRight: 'auto', 
              background: 'none', 
              border: 'none', 
              color: 'var(--on-background)',
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          
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

      <style jsx>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
