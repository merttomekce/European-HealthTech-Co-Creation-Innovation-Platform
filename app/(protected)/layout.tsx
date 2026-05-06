'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Megaphone, 
  Handshake, 
  User, 
  LogOut,
  MessageSquare,
  Users
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import NotificationBell from '@/components/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import './protected.css';

export default function ProtectedLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="shell">
      <nav className="dynamic-island-nav">
        <div className="dynamic-island-content">
          <Link 
            href="/dashboard" 
            className={`island-item ${pathname === '/dashboard' || pathname.startsWith('/doctor/dashboard') || pathname.startsWith('/engineer/dashboard') ? 'active' : ''}`} 
            title="Home"
          >
            <Home size={18} />
            <span className="island-label">Home</span>
          </Link>
          <Link href="/my-announcements" className={`island-item ${pathname.startsWith('/my-announcements') ? 'active' : ''}`} title="My Announcements">
            <Megaphone size={18} />
            <span className="island-label">Posts</span>
          </Link>
          <Link href="/my-requests" className={`island-item ${pathname.startsWith('/my-requests') ? 'active' : ''}`} title="My Requests">
            <Handshake size={18} />
            <span className="island-label">Requests</span>
          </Link>
          <Link href="/chats" className={`island-item ${pathname.startsWith('/chats') ? 'active' : ''}`} title="Chats">
            <MessageSquare size={18} />
            <span className="island-label">Chats</span>
          </Link>
          <Link href="/connections" className={`island-item ${pathname.startsWith('/connections') ? 'active' : ''}`} title="Connections">
            <Users size={18} />
            <span className="island-label">Connections</span>
          </Link>
          <Link href="/profile" className={`island-item ${pathname.startsWith('/profile') ? 'active' : ''}`} title="Profile">
            <User size={18} />
            <span className="island-label">Profile</span>
          </Link>
          
          <div className="island-divider"></div>
          
          <div className="island-widget">
            <NotificationBell />
          </div>
          <div className="island-widget">
            <ThemeToggle />
          </div>
          
          <button className="island-item sign-out" onClick={handleSignOut} title="Sign Out">
            <LogOut size={18} />
            <span className="island-label">Sign Out</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        <div className="page-container">
          {children}
        </div>
      </main>
      {modal}
    </div>
  );
}
