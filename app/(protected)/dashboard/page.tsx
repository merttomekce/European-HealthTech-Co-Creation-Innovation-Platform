'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/StoreContext';
import './dashboard.css';

const DEMO_USER_ID = 'user-current';

export default function DashboardPage() {
  const { announcements, interests, meetings, notifications } = useStore();

  const myInterests = interests.filter(i => ['user-current', 'user-eng-2'].includes(i.userId));
  const activeApplications = myInterests.length;
  const pendingMeetings = meetings.filter(m => m.status === 'Negotiation' || m.status === 'Scheduled').length;
  const unreadNotifs = notifications.filter(n => n.userId === DEMO_USER_ID && !n.isRead).length;

  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, Dr. Chen</h1>
        <p className="dashboard-subtitle">Here is what is happening across your collaborations today.</p>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card highlight">
          <span className="material-symbols-outlined kpi-icon">handshake</span>
          <div className="kpi-value">{activeApplications}</div>
          <div className="kpi-label">Active Applications</div>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined kpi-icon">event</span>
          <div className="kpi-value">{pendingMeetings}</div>
          <div className="kpi-label">Pending Meetings</div>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined kpi-icon">notifications</span>
          <div className="kpi-value">{unreadNotifs}</div>
          <div className="kpi-label">Unread Notifications</div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-section recent-activity">
          <div className="section-header">
            <h2 className="section-title">Newest Opportunities</h2>
            <Link href="/board" className="view-all-link">Browse Board →</Link>
          </div>
          
          <div className="recent-feed">
            {recentAnnouncements.map((ann, idx) => {
              const date = new Date();
              date.setDate(date.getDate() - idx);
              return (
                <Link key={ann.id} href={`/board/${ann.id}`} className="feed-item">
                  <div className="feed-date">
                    <span className="feed-day">{date.getDate()}</span>
                    <span className="feed-month">{date.toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="feed-content">
                    <div className="feed-meta">{ann.domain} • {ann.location}</div>
                    <div className="feed-title">{ann.title}</div>
                  </div>
                  <span className="material-symbols-outlined" style={{ alignSelf: 'center', opacity: 0.3 }}>
                    chevron_right
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="dashboard-section aside-actions">
           <div className="quick-actions">
             <h2 className="section-title" style={{ fontSize: '1.25rem' }}>Quick Actions</h2>
             <div className="quick-actions-list">
               <Link href="/announcements/new" className="action-btn">
                 <span className="material-symbols-outlined">add_circle</span>
                 Post a New Need
               </Link>
               <Link href="/board" className="action-btn">
                 <span className="material-symbols-outlined">search</span>
                 Find a Clinical Lead
               </Link>
               <Link href="/my-requests" className="action-btn">
                 <span className="material-symbols-outlined">history</span>
                 Review My Requests
               </Link>
               <Link href="/profile" className="action-btn">
                 <span className="material-symbols-outlined">person</span>
                 Update Profile
               </Link>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
