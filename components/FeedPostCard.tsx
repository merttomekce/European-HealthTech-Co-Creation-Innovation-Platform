'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

type FeedAnnouncement = {
  id: string;
  title: string;
  domain?: string | null;
  publicPitch?: string | null;
  explanation?: string | null;
  expertiseNeeded?: string | null;
  projectStage?: string | null;
  status?: string | null;
  city?: string | null;
  country?: string | null;
  createdAt?: string | Date | null;
  authorId?: string;
  author?: {
    name?: string | null;
    institution?: string | null;
    role?: string | null;
  } | null;
};

interface FeedPostCardProps {
  announcement: FeedAnnouncement;
  currentUserId: string;
  roleTone: 'doctor' | 'engineer';
}

function getInitials(name?: string | null) {
  if (!name) return 'NA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'NA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getRoleLabel(role?: string | null) {
  if (role === 'ENGINEER') return 'Engineer / Tech Expert';
  if (role === 'HEALTHCARE_PROFESSIONAL') return 'Healthcare Professional';
  return 'Contributor';
}

function formatStage(stage?: string | null) {
  return stage?.replace(/_/g, ' ') || 'CONCEPT';
}

export default function FeedPostCard({ announcement, currentUserId, roleTone }: FeedPostCardProps) {
  const router = useRouter();
  const date = announcement.createdAt ? new Date(announcement.createdAt) : new Date();
  const authorName = announcement.authorId === currentUserId ? 'You' : (announcement.author?.name || 'Research Lead');
  const authorHref = announcement.authorId && announcement.authorId !== currentUserId ? `/profile/${announcement.authorId}` : '/profile';
  const authorRole = getRoleLabel(announcement.author?.role);
  const authorInitials = getInitials(authorName);
  const location = announcement.city ? `${announcement.city}, ${announcement.country}` : announcement.country || 'Remote';
  const stage = formatStage(announcement.projectStage);
  const statusLabel = announcement.status === 'PARTNER_FOUND' ? 'Partner found' : 'Active';
  const pitch = announcement.publicPitch || announcement.explanation?.slice(0, 160) || 'Open collaboration thread.';

  const goToDetails = () => {
    router.push(`/board/${announcement.id}`);
  };

  return (
    <article
      className="dashboard-feed-card"
      role="link"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToDetails();
        }
      }}
    >
      <div className="feed-author-row">
        <Link
          href={authorHref}
          className="feed-author-link"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`feed-avatar feed-avatar--${roleTone}`} aria-hidden="true">
            {authorInitials}
          </div>
        </Link>

        <div className="feed-author-copy">
          <div className="feed-author-top">
            <Link
              href={authorHref}
              className="feed-author-text feed-author-link"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="feed-author-name">{authorName}</div>
              <div className="feed-author-meta">
                <span>{authorRole}</span>
                <span>{announcement.author?.institution || 'Independent'}</span>
              </div>
            </Link>
            <time className="feed-post-time" dateTime={date.toISOString()}>
              {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </time>
          </div>
        </div>
      </div>

      <div className="feed-chip-row">
        <span className={`board-badge board-badge-role ${announcement.author?.role === 'ENGINEER' ? 'engineer' : 'doctor'}`}>
          Looking for {announcement.author?.role === 'ENGINEER' ? 'Healthcare' : 'Engineer'}
        </span>
        <span className="board-badge board-badge-soft">{announcement.domain || 'Build'}</span>
        <span className="board-badge board-badge-soft">{stage}</span>
      </div>

      <h2 className="feed-project-title">{announcement.title}</h2>
      <p className="feed-project-copy">{pitch}</p>

      <div className="feed-detail-grid">
        <div className="feed-detail-item">
          <span className="feed-detail-label">Location</span>
          <span className="feed-detail-value">{location}</span>
        </div>
        <div className="feed-detail-item">
          <span className="feed-detail-label">Expertise</span>
          <span className="feed-detail-value feed-detail-truncate" title={announcement.expertiseNeeded || undefined}>
            {announcement.expertiseNeeded || 'General collaboration'}
          </span>
        </div>
        <div className="feed-detail-item">
          <span className="feed-detail-label">Status</span>
          <span className="feed-detail-value">{statusLabel}</span>
        </div>
      </div>

      <div className="feed-card-footer">
        <span className="board-footer-chip">{statusLabel}</span>
        <span className="board-footer-link">Open post</span>
      </div>
    </article>
  );
}
