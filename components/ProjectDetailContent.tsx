import Link from 'next/link';
import { BadgeCheck, Building2, CalendarRange, MapPin, ShieldCheck } from 'lucide-react';

interface AnnouncementLike {
  id: string;
  title: string;
  domain?: string;
  explanation?: string;
  expertiseNeeded?: string;
  projectStage?: string;
  commitmentLevel?: string;
  collaborationType?: string | null;
  confidentiality?: string;
  publicPitch?: string | null;
  city?: string;
  country?: string;
  status?: string;
  createdAt?: string | Date;
  author?: {
    name?: string | null;
    institution?: string | null;
    role?: string;
  } | null;
}

interface ProjectDetailContentProps {
  announcement: AnnouncementLike | null;
  compact?: boolean;
}

function formatLabel(value?: string | null) {
  if (!value) return 'Not set';
  return value.replace(/_/g, ' ');
}

export default function ProjectDetailContent({ announcement, compact = false }: ProjectDetailContentProps) {
  if (!announcement) return null;

  const authorName = announcement.author?.name || 'Research lead';
  const authorInstitution = announcement.author?.institution || 'Institution not shared';
  const location = [announcement.city, announcement.country].filter(Boolean).join(', ') || 'Location not shared';
  const summary = announcement.publicPitch || announcement.explanation || announcement.expertiseNeeded || '';

  return (
    <section className={`project-detail-panel ${compact ? 'project-detail-panel--compact' : ''}`}>
      <div className="project-detail-panel__top">
        <div>
          <p className="project-detail-panel__kicker">Project context</p>
          <h3 className="project-detail-panel__title">{announcement.title}</h3>
        </div>
        <Link href={`/board/${announcement.id}`} className="project-detail-panel__link">
          Open post
        </Link>
      </div>

      <div className="project-detail-panel__meta">
        <span className="project-detail-panel__chip">
          <Building2 size={14} />
          {announcement.domain || 'Medical'}
        </span>
        <span className="project-detail-panel__chip">
          <MapPin size={14} />
          {location}
        </span>
        <span className="project-detail-panel__chip">
          <ShieldCheck size={14} />
          {formatLabel(announcement.confidentiality)}
        </span>
        <span className="project-detail-panel__chip">
          <CalendarRange size={14} />
          {formatLabel(announcement.projectStage)}
        </span>
      </div>

      <div className="project-detail-panel__author">
        <div className="project-detail-panel__author-name">{authorName}</div>
        <div className="project-detail-panel__author-subline">
          {authorInstitution}
          {announcement.createdAt ? ` · ${new Date(announcement.createdAt).toLocaleDateString()}` : ''}
        </div>
      </div>

      <p className="project-detail-panel__summary">{summary}</p>

      <div className="project-detail-panel__grid">
        <div className="project-detail-panel__stat">
          <span className="project-detail-panel__stat-label">Need</span>
          <span className="project-detail-panel__stat-value">{announcement.expertiseNeeded || 'Unspecified'}</span>
        </div>
        <div className="project-detail-panel__stat">
          <span className="project-detail-panel__stat-label">Commitment</span>
          <span className="project-detail-panel__stat-value">{formatLabel(announcement.commitmentLevel)}</span>
        </div>
        <div className="project-detail-panel__stat">
          <span className="project-detail-panel__stat-label">Collab type</span>
          <span className="project-detail-panel__stat-value">{formatLabel(announcement.collaborationType)}</span>
        </div>
        <div className="project-detail-panel__stat">
          <span className="project-detail-panel__stat-label">Status</span>
          <span className="project-detail-panel__stat-value">{formatLabel(announcement.status)}</span>
        </div>
      </div>

      <div className="project-detail-panel__footer">
        <span className="project-detail-panel__pulse">
          <BadgeCheck size={14} />
          {announcement.author?.role || 'Collaborator'}
        </span>
      </div>
    </section>
  );
}
