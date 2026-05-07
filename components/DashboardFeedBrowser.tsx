'use client';

import React from 'react';
import FeedPostCard from '@/components/FeedPostCard';

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
  authorId?: string;
  author?: {
    name?: string | null;
    institution?: string | null;
    role?: string | null;
  } | null;
};

function normalize(value?: string | null) {
  return (value || '').toLowerCase();
}

function matchesQuery(ann: FeedAnnouncement, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const fields = [
    ann.title,
    ann.domain,
    ann.projectStage,
    ann.city,
    ann.country,
    ann.author?.name,
    ann.author?.institution,
    ann.author?.role,
    ann.expertiseNeeded,
    ann.explanation,
    ann.publicPitch,
  ];

  return fields.some((field) => normalize(field).includes(q));
}

interface DashboardFeedBrowserProps {
  announcements: FeedAnnouncement[];
  currentUserId: string;
  roleTone: 'doctor' | 'engineer';
  emptyMessage: string;
}

export default function DashboardFeedBrowser({
  announcements,
  currentUserId,
  roleTone,
  emptyMessage,
}: DashboardFeedBrowserProps) {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<string>('all');

  const categories = React.useMemo(() => {
    const domains = Array.from(
      new Set(
        announcements
          .map((ann) => ann.domain?.trim())
          .filter((domain): domain is string => Boolean(domain))
      )
    ).sort((a, b) => a.localeCompare(b));

    return ['all', ...domains];
  }, [announcements]);

  const filtered = React.useMemo(
    () => announcements.filter((ann) => {
      const categoryMatch = category === 'all' || normalize(ann.domain).includes(category.toLowerCase());
      return categoryMatch && matchesQuery(ann, query);
    }),
    [announcements, category, query]
  );

  return (
    <>
      <div className="dashboard-search-bar">
        <label className="dashboard-search-field">
          <span className="material-symbols-outlined dashboard-search-icon">search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search announcements"
            className="dashboard-search-input"
          />
        </label>

        <div className="dashboard-search-categories" role="tablist" aria-label="Feed categories">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={`dashboard-search-chip ${category === item ? 'active' : ''}`}
              onClick={() => setCategory(item)}
              role="tab"
              aria-selected={category === item}
            >
              {item === 'all' ? 'All' : item}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="dashboard-empty">
          <span className="material-symbols-outlined dashboard-empty-icon">search_off</span>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="dashboard-feed-stream">
          {filtered.map((ann) => (
            <FeedPostCard
              key={ann.id}
              announcement={ann}
              currentUserId={currentUserId}
              roleTone={roleTone}
            />
          ))}
        </div>
      )}
    </>
  );
}
