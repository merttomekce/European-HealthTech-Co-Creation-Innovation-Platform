import Link from 'next/link';
import { ArrowRight, Building2, MessageSquareText, MapPin, UserRound } from 'lucide-react';

interface LatestProject {
  id: string;
  title: string;
  domain?: string;
  status?: string;
  city?: string;
  country?: string;
}

interface ConnectionCardProps {
  person: {
    id: string;
    name: string;
    roleLabel: string;
    institution: string;
    location: string;
    initials: string;
    signal: string;
    threadLabel?: string;
    threadId?: string | null;
    touchpointCount: number;
    latestProject?: LatestProject | null;
    matchNote?: string;
  };
}

function formatStatus(value?: string | null) {
  if (!value) return 'Open';
  return value.replace(/_/g, ' ');
}

export default function ConnectionCard({ person }: ConnectionCardProps) {
  return (
    <article className="connection-card">
      <div className="connection-card__identity">
        <div className="connection-card__avatar">{person.initials}</div>
        <div className="connection-card__identity-copy">
          <div className="connection-card__name-row">
            <h3 className="connection-card__name">{person.name}</h3>
            <span className="connection-card__signal">{person.signal}</span>
          </div>
          <p className="connection-card__role">{person.roleLabel}</p>
          <div className="connection-card__meta">
            <span className="connection-card__meta-item">
              <Building2 size={14} />
              {person.institution}
            </span>
            <span className="connection-card__meta-item">
              <MapPin size={14} />
              {person.location}
            </span>
          </div>
        </div>
      </div>

      <div className="connection-card__compare">
        <div className="connection-card__compare-row">
          <span className="connection-card__compare-label">Touchpoints</span>
          <span className="connection-card__compare-value">{person.touchpointCount}</span>
        </div>
        <div className="connection-card__compare-row">
          <span className="connection-card__compare-label">Thread</span>
          <span className="connection-card__compare-value">{person.threadLabel || 'Not started'}</span>
        </div>
        <div className="connection-card__compare-row">
          <span className="connection-card__compare-label">Current work</span>
          <span className="connection-card__compare-value">
            {person.latestProject ? `${person.latestProject.domain || 'Project'} · ${formatStatus(person.latestProject.status)}` : 'No open project'}
          </span>
        </div>
        {person.matchNote && (
          <div className="connection-card__note">
            <UserRound size={14} />
            {person.matchNote}
          </div>
        )}
      </div>

      <div className="connection-card__actions">
        {person.threadId ? (
          <Link href={`/chats/${person.threadId}`} className="connection-card__action connection-card__action--primary">
            <MessageSquareText size={16} />
            Open thread
          </Link>
        ) : (
          <Link href={`/profile/${person.id}`} className="connection-card__action connection-card__action--primary">
            <MessageSquareText size={16} />
            View profile
          </Link>
        )}
        <Link href={`/profile/${person.id}`} className="connection-card__action">
          <ArrowRight size={16} />
          Profile
        </Link>
      </div>
    </article>
  );
}
