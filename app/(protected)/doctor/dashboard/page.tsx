import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAnnouncements } from '@/lib/actions/announcements';
import prisma from '@/lib/prisma';
import DashboardFeedBrowser from '@/components/DashboardFeedBrowser';
import './dashboard.css';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true },
  });

  const firstName = userData?.name ? userData.name.split(' ')[0] : 'Doctor';
  const hour = new Date().getHours();

  const allAnnouncementsRes = await getAnnouncements();
  const opportunityFeed = allAnnouncementsRes.success
    ? allAnnouncementsRes.data!.slice(0, 8)
    : [];
  const feedTitle = `Good ${hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'}, ${firstName}`;

  return (
    <div className="dashboard-page dashboard-doctor">
      <section className="dashboard-feed-layout">
        <div className="dashboard-feed-main">
          <header className="dashboard-feed-header">
            <div className="dashboard-feed-intro">
              <p className="section-kicker">Your feed</p>
              <h1 className="dashboard-feed-title">{feedTitle}</h1>
              <p className="dashboard-feed-subtitle">
                Scan collaboration posts, see who posted them, and move promising threads into review.
              </p>
            </div>
            <div className="dashboard-feed-actions">
              <Link href="/post-project" className="hero-link hero-link--primary">
                <span className="material-symbols-outlined">add_circle</span>
                <span>Post clinical need</span>
              </Link>
            </div>
          </header>

          <DashboardFeedBrowser
            announcements={opportunityFeed as any[]}
            currentUserId={user.id}
            roleTone="doctor"
            emptyMessage="No matches for this search."
          />
        </div>

      </section>
    </div>
  );
}
