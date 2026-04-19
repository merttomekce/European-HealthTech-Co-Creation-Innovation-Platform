import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getMyAnnouncements, getAnnouncements } from '@/lib/actions/announcements';
import { getMySentRequests } from '@/lib/actions/meetings';
import { getUnreadCount } from '@/lib/actions/notifications';
import prisma from '@/lib/prisma';
import './dashboard.css';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Real user data fetching
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true }
  });

  const firstName = userData?.name ? userData.name.split(' ')[0] : 'Innovator';

  const [
    myAnnouncementsRes, 
    mySentRequestsRes, 
    unreadNotifsCount, 
    allAnnouncementsRes
  ] = await Promise.all([
    getMyAnnouncements(),
    getMySentRequests(),
    getUnreadCount(),
    getAnnouncements()
  ]);

  const activeApplications = mySentRequestsRes.success ? mySentRequestsRes.data!.length : 0;
  
  const pendingMeetings = (mySentRequestsRes.success ? mySentRequestsRes.data! : []).filter(
    (m: any) => m.status === 'SLOTS_PROPOSED' || m.status === 'CONFIRMED'
  ).length;

  const myAnnouncementsCount = myAnnouncementsRes.success ? myAnnouncementsRes.data!.length : 0;

  const opportunityFeed = allAnnouncementsRes.success 
    ? allAnnouncementsRes.data!.filter((a: any) => a.authorId !== user.id).slice(0, 4)
    : [];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">{greeting}, {firstName}</h1>
        <p className="dashboard-subtitle">
          Here is what is happening across your technical collaborations today.
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
          <div className="kpi-value">{myAnnouncementsCount}</div>
          <div className="kpi-label">My Announcements</div>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined kpi-icon">notifications</span>
          <div className="kpi-value">{unreadNotifsCount}</div>
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
              {opportunityFeed.map((ann: any, idx: number) => {
                const date = new Date(ann.createdAt);
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
                        {ann.city && ` • ${ann.city}`}
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
