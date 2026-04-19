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
  Menu,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import NotificationBell from '@/components/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import './protected.css';

interface NavItemProps {
  href: string;
  icon: any;
  label: string;
  active: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
}

const NavItem = ({ href, icon: Icon, label, active, isCollapsed, onClick }: NavItemProps) => (
  <Link href={href} className={`nav-item ${active ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`} onClick={onClick} title={label}>
    <div className="nav-icon">
      <Icon size={20} />
    </div>
    {!isCollapsed && <span>{label}</span>}
  </Link>
);

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/board', icon: LayoutGrid, label: 'Co-Creation Board' },
    { href: '/my-announcements', icon: Megaphone, label: 'My Announcements' },
    { href: '/my-requests', icon: Handshake, label: 'My Requests' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  const [userProfile, setUserProfile] = React.useState({
    name: '',
    role: '',
    initials: '',
  });

  React.useEffect(() => {
    async function loadProfile() {
      const { getNavProfile } = await import('@/lib/actions/profile');
      const profile = await getNavProfile();
      setUserProfile(profile);
    }
    loadProfile();
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

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

      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="logo-section">
          {!isCollapsed && <div className="logo-text">HealthAI</div>}
          {isCollapsed && <div className="logo-text-collapsed">H</div>}
          <button 
            className="collapse-btn" 
            onClick={toggleCollapse} 
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="nav-group">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname.startsWith(item.href)}
              isCollapsed={isCollapsed}
              onClick={closeMobileMenu}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar-placeholder">{userProfile.initials}</div>
            {!isCollapsed && (
              <div className="user-info">
                <div className="user-name">{userProfile.name}</div>
                <div className="user-role-badge">{userProfile.role}</div>
              </div>
            )}
          </div>
          <button className="sign-out-btn" onClick={handleSignOut} aria-label="Sign out" title="Sign Out">
            <LogOut size={18} />
            {!isCollapsed && <span>Sign Out</span>}
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
            <Menu size={24} />
          </button>
          
          <div className="top-bar-right">
              <ThemeToggle />
              <NotificationBell />
          </div>
        </header>

        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
}
