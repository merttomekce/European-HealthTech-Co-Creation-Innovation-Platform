'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/StoreContext';
import './dashboard.css';

const DEMO_USER_ID = 'user-current';

// Mock name - will be replaced by real session in Phase 3
const DEMO_USER_NAME = 'Dr. Sarah Chen';

export default function DashboardPage() {
  const { announcements, interests, meetings, notifications } = useStore();

  // Dynamically calculated KPIs from the store
  const myInterests = interests.filter(
    (i) => i.userId === DEMO_USER_ID || i.userId === 'user-eng-2'
  );
  const myAnnouncements = announcements.filter(
    (a) => a.author === DEMO_USER_NAME
  );
  const activeApplications = myInterests.length;
  const pendingMeetings = meetings.filter(
    (m) => m.status === 'Negotiation' || m.status === 'Scheduled'
  ).length;
  const unreadNotifs = notifications.filter(
    (n) => n.userId === DEMO_USER_ID && !n.isRead
  ).length;

  // Opportunities - exclude user's own announcements
  const opportunityFeed = announcements
    .filter((a) => a.author !== DEMO_USER_NAME)
    .slice(0, 4);

  // Greeting suffix e.g. "Good morning"
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = DEMO_USER_NAME.split(' ')[1] || DEMO_USER_NAME;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">{greeting}, {firstName}</h1>
        <p className="dashboard-subtitle">
          Here is what is happening across your collaborations today.
        </p>
      </header>

      {/* KPI Row */}
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
          <span className="material-symbols-outlined kpi-icon">campaign</span>
          <div className="kpi-value">{myAnnouncements.length}</div>
          <div className="kpi-label">My Announcements</div>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined kpi-icon">notifications</span>
          <div className="kpi-value">{unreadNotifs}</div>
          <div className="kpi-label">Unread Notifications</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-main-grid">
        {/* Co-creation Feed */}
        <div className="dashboard-section recent-activity">
          <div className="section-header">
            <h2 className="section-title">Newest Opportunities</h2>
            <Link href="/board" className="view-all-link">Browse Board →</Link>
          </div>

          {opportunityFeed.length === 0 ? (
            <div className="empty-state-inline">
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', opacity: 0.25 }}>search_off</span>
              <p>No new announcements yet. Check back soon.</p>
            </div>
          ) : (
            <div className="recent-feed">
              {opportunityFeed.map((ann, idx) => {
                const date = new Date();
                date.setDate(date.getDate() - idx);
                return (
                  <Link key={ann.id} href={`/board/${ann.id}`} className="feed-item">
                    <div className="feed-date">
                      <span className="feed-day">{date.getDate()}</span>
                      <span className="feed-month">
                        {date.toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>
                    <div className="feed-content">
                      <div className="feed-meta">
                        {ann.domain}
                        {ann.location && ` • ${ann.location}`}
                      </div>
                      <div className="feed-title">{ann.title}</div>
                    </div>
                    <span
                      className="material-symbols-outlined"
                      style={{ alignSelf: 'center', opacity: 0.3 }}
                    >
                      chevron_right
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section aside-actions">
          <div className="quick-actions">
            <h2 className="section-title" style={{ fontSize: '1.25rem' }}>
              Quick Actions
            </h2>
            <div className="quick-actions-list">
              <Link href="/board/create" className="action-btn">
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
