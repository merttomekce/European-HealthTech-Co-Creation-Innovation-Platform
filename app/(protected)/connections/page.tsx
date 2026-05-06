import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import ConnectionCard from '@/components/ConnectionCard';
import ProjectDetailContent from '@/components/ProjectDetailContent';
import './connections.css';

function roleLabel(role?: string | null) {
  switch (role) {
    case 'HEALTHCARE_PROFESSIONAL':
      return 'Healthcare Professional';
    case 'ENGINEER':
      return 'Engineer / Tech Expert';
    case 'ADMIN':
      return 'Administrator';
    default:
      return 'Collaborator';
  }
}

function initialsFrom(name?: string | null, fallback = 'CN') {
  if (!name) return fallback;
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return fallback;
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function locationLabel(user: { city?: string | null; country?: string | null }) {
  return [user.city, user.country].filter(Boolean).join(', ') || 'Location not shared';
}

export default async function ConnectionsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const [authProfile, announcements, myAnnouncements, sentRequests, receivedRequests] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, role: true, institution: true, city: true, country: true, expertise: true },
    }),
    prisma.announcement.findMany({
      where: { authorId: { not: user.id } },
      include: { author: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.announcement.findMany({
      where: { authorId: user.id },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
      take: 1,
    }),
    prisma.meetingRequest.findMany({
      where: { requesterId: user.id },
      select: { id: true, recipientId: true, announcementId: true, status: true },
    }),
    prisma.meetingRequest.findMany({
      where: { recipientId: user.id },
      select: { id: true, requesterId: true, announcementId: true, status: true },
    }),
  ]);

  const requestMap = new Map<string, { threadId: string; status: string; direction: 'incoming' | 'outgoing'; announcementId: string }>();

  sentRequests.forEach((request) => {
    requestMap.set(request.announcementId, {
      threadId: request.id,
      status: request.status,
      direction: 'outgoing',
      announcementId: request.announcementId,
    });
  });

  receivedRequests.forEach((request) => {
    requestMap.set(request.announcementId, {
      threadId: request.id,
      status: request.status,
      direction: 'incoming',
      announcementId: request.announcementId,
    });
  });

  const grouped = new Map<string, any>();

  announcements.forEach((announcement) => {
    const authorId = announcement.authorId;
    const existing = grouped.get(authorId);
    const touchpoint = requestMap.get(announcement.id);

    if (!existing) {
        grouped.set(authorId, {
          id: authorId,
          name: announcement.author?.name || 'Unknown collaborator',
          roleLabel: roleLabel(announcement.author?.role),
          institution: announcement.author?.institution || 'Institution not shared',
          location: locationLabel(announcement.author || {}),
          initials: initialsFrom(announcement.author?.name),
          signal: touchpoint ? (touchpoint.direction === 'incoming' ? 'Awaiting reply' : 'Active thread') : 'Open contact',
          threadLabel: touchpoint ? touchpoint.status.replace(/_/g, ' ') : 'No thread',
          threadId: touchpoint?.threadId || null,
          touchpointCount: touchpoint ? 1 : 0,
          latestProject: {
            id: announcement.id,
            title: announcement.title,
            domain: announcement.domain,
            status: announcement.status,
            city: announcement.city,
            country: announcement.country,
            updatedAt: announcement.updatedAt,
          },
          matchNote: authProfile?.city && announcement.author?.city && authProfile.city === announcement.author.city
          ? 'Same city as you'
          : announcement.author?.country && authProfile?.country && announcement.author.country === authProfile.country
            ? 'Same country as you'
            : undefined,
      });
      return;
    }

    existing.touchpointCount += touchpoint ? 1 : 0;
    existing.threadId = existing.threadId || touchpoint?.threadId || null;
    if (existing.latestProject && new Date(announcement.updatedAt) > new Date(existing.latestProject.updatedAt || 0)) {
      existing.latestProject = {
        id: announcement.id,
        title: announcement.title,
        domain: announcement.domain,
        status: announcement.status,
        city: announcement.city,
        country: announcement.country,
        updatedAt: announcement.updatedAt,
      };
    }
    grouped.set(authorId, existing);
  });

  const connections = Array.from(grouped.values())
    .sort((a, b) => {
      if (a.threadId && !b.threadId) return -1;
      if (!a.threadId && b.threadId) return 1;
      return a.name.localeCompare(b.name);
    });

  const featuredAnnouncement = myAnnouncements[0] || announcements[0] || null;

  return (
    <div className="connections-shell">
      <header className="connections-header">
        <div>
          <p className="connections-header__eyebrow">Profile comparison surface</p>
          <h1 className="connections-header__title">Connections</h1>
          <p className="connections-header__subtitle">
            Read people, work, and context side by side. Keep collaboration signals in one dense workspace.
          </p>
        </div>

        <div className="connections-header__meta">
          <div className="connections-header__stat">
            <span>Open profiles</span>
            <strong>{connections.length}</strong>
          </div>
          <div className="connections-header__stat">
            <span>Your projects</span>
            <strong>{myAnnouncements.length}</strong>
          </div>
          <div className="connections-header__stat">
            <span>Your role</span>
            <strong>{roleLabel(authProfile?.role)}</strong>
          </div>
        </div>
      </header>

      <section className="connections-compare">
        <div className="connections-compare__panel">
          <p className="connections-compare__kicker">Your profile</p>
          <h2 className="connections-compare__title">{authProfile?.name || 'Profile not loaded'}</h2>
          <div className="connections-compare__summary">
            <span>{roleLabel(authProfile?.role)}</span>
            <span>{authProfile?.institution || 'Institution not shared'}</span>
            <span>{locationLabel(authProfile || {})}</span>
          </div>
          <div className="connections-compare__expertise">
            {(authProfile?.expertise || []).slice(0, 4).map((tag) => (
              <span key={tag} className="connections-pill">{tag}</span>
            ))}
            {(authProfile?.expertise || []).length === 0 && <span className="connections-muted">No expertise tags set</span>}
          </div>
          <div className="connections-compare__actions">
            <Link href="/profile" className="connections-button connections-button--primary">Edit profile</Link>
            <Link href="/my-requests" className="connections-button">Review requests</Link>
          </div>
        </div>

        <div className="connections-compare__panel connections-compare__panel--feature">
          <p className="connections-compare__kicker">Current project</p>
          <ProjectDetailContent announcement={featuredAnnouncement} compact />
        </div>
      </section>

      <section className="connections-list">
        <div className="connections-list__header">
          <h2>Collaborators in view</h2>
          <p>Each row compares role, institution, location, and latest project signal.</p>
        </div>

        {connections.length === 0 ? (
          <div className="connections-empty">
            <h3>No live connections yet.</h3>
            <p>Open the board, express interest, and the workspace will start filling with people and threads.</p>
            <Link href="/dashboard" className="connections-button connections-button--primary">Browse feed</Link>
          </div>
        ) : (
          <div className="connections-stack">
            {connections.map((person) => (
              <ConnectionCard key={person.id} person={person} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
