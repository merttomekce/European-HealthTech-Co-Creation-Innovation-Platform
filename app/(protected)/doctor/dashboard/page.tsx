import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getMyAnnouncements, getAnnouncements } from '@/lib/actions/announcements';
import { getMySentRequests } from '@/lib/actions/meetings';
import { getUnreadCount } from '@/lib/actions/notifications';
import prisma from '@/lib/prisma';
import './dashboard.css';

function formatCount(value: number) {
  return value.toString().padStart(2, '0');
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true },
  });

  const firstName = userData?.name ? userData.name.split(' ')[0] : 'Doctor';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const [
    myAnnouncementsRes,
    mySentRequestsRes,
    unreadNotifsCount,
    allAnnouncementsRes,
  ] = await Promise.all([
    getMyAnnouncements(),
    getMySentRequests(),
    getUnreadCount(),
    getAnnouncements(),
  ]);

  const myAnnouncementsCount = myAnnouncementsRes.success ? myAnnouncementsRes.data!.length : 0;
  const activeRequests = mySentRequestsRes.success ? mySentRequestsRes.data!.length : 0;
  const pendingMeetings = (mySentRequestsRes.success ? mySentRequestsRes.data! : []).filter(
    (m: any) => m.status === 'SLOTS_PROPOSED' || m.status === 'CONFIRMED'
  ).length;
  const opportunityFeed = allAnnouncementsRes.success
    ? allAnnouncementsRes.data!.filter((a: any) => a.authorId !== user.id).slice(0, 5)
    : [];

  const kpis = [
    { label: 'Open consults', value: activeRequests, hint: 'Incoming collaboration requests', icon: 'medical_services' },
    { label: 'Meetings queued', value: pendingMeetings, hint: 'Live scheduling threads', icon: 'event' },
    { label: 'Clinical posts', value: myAnnouncementsCount, hint: 'Your active problem statements', icon: 'description' },
    { label: 'Unread signals', value: unreadNotifsCount, hint: 'New platform activity', icon: 'notifications' },
  ];

  return (
    <div className="dashboard-page dashboard-doctor">
      <section className="dashboard-hero dashboard-hero-doctor">
        <div className="dashboard-hero-copy">
          <p className="dashboard-kicker">Clinical editorial desk</p>
          <h1 className="dashboard-title">
            {greeting}, {firstName}
          </h1>
          <p className="dashboard-subtitle">
            Scan new collaboration demand, tighten clinical framing, and move promising threads into review.
          </p>
        </div>
        <div className="dashboard-hero-panel">
          <div className="hero-panel-label">Today</div>
          <div className="hero-panel-value">{formatCount(opportunityFeed.length)}</div>
          <div className="hero-panel-note">New opportunities in board feed</div>
          <div className="hero-panel-links">
            <Link href="/board/create" className="hero-link">Post clinical need</Link>
            <Link href="/board" className="hero-link">Browse board</Link>
          </div>
        </div>
      </section>

      <section className="dashboard-kpi-grid" aria-label="Dashboard metrics">
        {kpis.map((item) => (
          <article key={item.label} className="dashboard-kpi-card">
            <span className="material-symbols-outlined dashboard-kpi-icon">{item.icon}</span>
            <div className="dashboard-kpi-value">{item.value}</div>
            <div className="dashboard-kpi-label">{item.label}</div>
            <div className="dashboard-kpi-hint">{item.hint}</div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-feed-shell">
          <div className="section-header">
            <div>
              <p className="section-kicker">Latest from board</p>
              <h2 className="section-title">Opportunities worth review</h2>
            </div>
            <Link href="/board" className="section-link">View all</Link>
          </div>

          {opportunityFeed.length === 0 ? (
            <div className="dashboard-empty">
              <span className="material-symbols-outlined dashboard-empty-icon">search_off</span>
              <p>No new opportunities yet.</p>
            </div>
          ) : (
            <div className="dashboard-feed-list">
              {opportunityFeed.map((ann: any) => {
                const date = new Date(ann.createdAt);
                return (
                  <Link key={ann.id} href={`/board/${ann.id}`} className="dashboard-feed-row">
                    <div className="feed-date-pill">
                      <span className="feed-date-day">{date.getDate()}</span>
                      <span className="feed-date-month">
                        {date.toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>
                    <div className="feed-copy">
                      <div className="feed-meta">
                        <span>{ann.domain || 'Clinical'}</span>
                        {ann.city && <span>{ann.city}</span>}
                      </div>
                      <div className="feed-title">{ann.title}</div>
                      <p className="feed-summary">
                        {ann.publicPitch || ann.explanation?.slice(0, 140) || 'Open collaboration thread.'}
                      </p>
                    </div>
                    <span className="material-symbols-outlined feed-chevron">chevron_right</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <aside className="dashboard-aside">
          <div className="aside-card">
            <div className="section-header">
              <div>
                <p className="section-kicker">Clinical actions</p>
                <h2 className="section-title">Keep pipeline moving</h2>
              </div>
            </div>
            <div className="action-list">
              <Link href="/board/create" className="action-row">
                <span className="material-symbols-outlined">add_circle</span>
                <span>Post new need</span>
              </Link>
              <Link href="/my-requests" className="action-row">
                <span className="material-symbols-outlined">schedule</span>
                <span>Review meeting threads</span>
              </Link>
              <Link href="/my-announcements" className="action-row">
                <span className="material-symbols-outlined">draft</span>
                <span>Manage posts</span>
              </Link>
              <Link href="/profile" className="action-row">
                <span className="material-symbols-outlined">person</span>
                <span>Update profile</span>
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
