'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Group, Newspaper, History, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';
import AICompanion from '@/components/AICompanion';

const navItems = [
  { href: '/admin', label: 'Home', icon: Home, match: (pathname: string) => pathname === '/admin' },
  { href: '/admin/users', label: 'Users', icon: Group, match: (pathname: string) => pathname.startsWith('/admin/users') },
  { href: '/admin/posts', label: 'Posts', icon: Newspaper, match: (pathname: string) => pathname.startsWith('/admin/posts') },
  { href: '/admin/logs', label: 'Logs', icon: History, match: (pathname: string) => pathname.startsWith('/admin/logs') },
  { href: '/admin/settings', label: 'Settings', icon: Settings, match: (pathname: string) => pathname.startsWith('/admin/settings') },
];

export default function AdminSidebar({ children }: { children: React.ReactNode; adminName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [companionOpen, setCompanionOpen] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    document.cookie = 'dev_bypass=; path=/; max-age=0; samesite=lax';
    router.replace('/login');
    router.refresh();
  };

  return (
    <div className={`shell ${companionOpen ? 'shell--companion-open' : ''}`}>
      <div className="content-shell">
        <nav className="dynamic-island-nav">
          <div className="dynamic-island-content">
            {navItems.map(({ href, label, icon: Icon, match }) => (
              <Link
                key={href}
                href={href}
                className={`island-item ${match(pathname) ? 'active' : ''}`}
                title={label}
              >
                <Icon size={18} />
                <span className="island-label">{label}</span>
              </Link>
            ))}

            <div className="island-divider" />

            <div className="island-widget">
              <ThemeToggle />
            </div>

            <button className="island-item sign-out" onClick={handleSignOut} title="Sign Out" disabled={isSigningOut}>
              <LogOut size={18} />
              <span className="island-label">{isSigningOut ? 'Signing out' : 'Sign Out'}</span>
            </button>
          </div>
        </nav>

        <main className="main-content">
          <div className="page-container admin-page-container">
            {children}
          </div>
        </main>
      </div>

      <AICompanion open={companionOpen} onOpenChange={setCompanionOpen} />
    </div>
  );
}
