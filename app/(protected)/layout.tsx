'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  LayoutGrid, 
  Megaphone, 
  Handshake, 
  User, 
  LogOut, 
  Menu 
} from 'lucide-animated';
import { createClient } from '@/lib/supabase/client';
import { StoreProvider } from '@/lib/StoreContext';
import NotificationBell from '@/components/NotificationBell';
import './protected.css';

interface NavItemProps {
  href: string;
  icon: any;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const NavItem = ({ href, icon: Icon, label, active, onClick }: NavItemProps) => (
  <Link href={href} className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
    <div className="nav-icon">
      <Icon size={20} animate="hover" />
    </div>
    <span>{label}</span>
  </Link>
);

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/board', icon: LayoutGrid, label: 'Co-Creation Board' },
    { href: '/my-announcements', icon: Megaphone, label: 'My Announcements' },
    { href: '/my-requests', icon: Handshake, label: 'My Requests' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  // Placeholder user data
  const user = {
    name: 'Dr. Sarah Chen',
    role: 'Healthcare Professional',
    initials: 'SC',
    notifications: 3,
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const router = useRouter();
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className={`shell ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div className="mobile-backdrop" onClick={closeMobileMenu} />
      )}

      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="logo-section">
          <div className="logo-text">HealthAI</div>
        </div>

        <nav className="nav-group">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname.startsWith(item.href)}
              onClick={closeMobileMenu}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar-placeholder">{user.initials}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role-badge">{user.role}</div>
            </div>
          </div>
          <button className="sign-out-btn" onClick={handleSignOut} aria-label="Sign out">
            <LogOut size={18} animate="hover" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <button 
            className="mobile-menu-btn" 
            onClick={toggleMobileMenu}
            aria-label="Toggle Menu"
          >
            <Menu size={24} animate="hover" />
          </button>
          
          <div className="top-bar-right">
            <StoreProvider>
              <NotificationBell />
            </StoreProvider>
          </div>
        </header>

        <div className="page-container">
          <StoreProvider>
            {children}
          </StoreProvider>
        </div>
      </main>
    </div>
  );
}
