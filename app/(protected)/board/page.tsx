'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, SearchX, SlidersHorizontal, MapPin, Lightbulb } from 'lucide-react';
import { getAnnouncements } from '@/lib/actions/announcements';
import { getAuthProfile } from '@/lib/actions/profile';
import { useRealtime } from '@/lib/hooks/useRealtime';
import { createClient } from '@/lib/supabase/client';
import './board.css';

export default function BoardPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string>();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState<string>('All');
  const [filterCity, setFilterCity] = useState<string>('All');
  const [filterCountry, setFilterCountry] = useState<string>('All');
  const [filterStage, setFilterStage] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE');
  const [filterExpertise, setFilterExpertise] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useRealtime(userId);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const profileRes = await getAuthProfile();
        if (profileRes.success && profileRes.data) {
          setUserProfile(profileRes.data);
        }
      }

      const result = await getAnnouncements();
      if (result.success) {
        setAnnouncements(result.data || []);
      }
      setLoading(false);
    }

    init();
  }, []);

  const { domains, cities, countries, stages } = useMemo(() => {
    const d = new Set<string>();
    const ci = new Set<string>();
    const co = new Set<string>();
    const st = new Set<string>();

    announcements.forEach((a) => {
      if (a.domain) d.add(a.domain);
      if (a.city) ci.add(a.city);
      if (a.country) co.add(a.country);
      if (a.projectStage) st.add(a.projectStage);
    });

    return {
      domains: ['All', ...Array.from(d).sort()],
      cities: ['All', ...Array.from(ci).sort()],
      countries: ['All', ...Array.from(co).sort()],
      stages: ['All', ...Array.from(st)],
    };
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.publicPitch?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (a.explanation?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      const matchesDomain = filterDomain === 'All' || a.domain === filterDomain;
      const matchesCity = filterCity === 'All' || a.city === filterCity;
      const matchesCountry = filterCountry === 'All' || a.country === filterCountry;
      const matchesStage = filterStage === 'All' || a.projectStage === filterStage;
      const matchesStatus = filterStatus === 'All' || a.status === filterStatus;

      let matchesExpertise = true;
      if (filterExpertise.trim() !== '') {
        matchesExpertise = (a.expertiseNeeded || '').toLowerCase().includes(filterExpertise.toLowerCase());
      }

      return matchesSearch && matchesDomain && matchesCity && matchesCountry && matchesStage && matchesStatus && matchesExpertise;
    });
  }, [filterDomain, filterCity, filterCountry, filterStage, filterStatus, filterExpertise, searchQuery, announcements]);

  const activeCount = filteredAnnouncements.length;
  const localMatches = filteredAnnouncements.filter((item) => {
    return Boolean(userProfile?.city && item.city && item.city.toLowerCase() === userProfile.city.toLowerCase());
  }).length;

  const feedCards = filteredAnnouncements.map((item) => {
    const isLocalMatch = Boolean(userProfile?.city && item.city && item.city.toLowerCase() === userProfile.city.toLowerCase());
    let sharedExpertise: string[] = [];
    if (userProfile?.expertise && Array.isArray(userProfile.expertise) && item.expertiseNeeded) {
      const itemReqs = item.expertiseNeeded.toLowerCase();
      sharedExpertise = userProfile.expertise.filter((skill: string) => itemReqs.includes(skill.toLowerCase()));
    }

    const createdAt = item.createdAt ? new Date(item.createdAt) : null;
    const statusLabel = item.status === 'PARTNER_FOUND' ? 'Partner found' : 'Active';

    return (
      <Link key={item.id} href={`/board/${item.id}`} className="board-card">
        <div className="board-card-topline">
          <div className="board-card-badges">
            <span className={`board-badge board-badge-role ${item.author?.role === 'ENGINEER' ? 'engineer' : 'doctor'}`}>
              Looking for {item.author?.role === 'ENGINEER' ? 'Healthcare' : 'Engineer'}
            </span>
            <span className="board-badge board-badge-soft">{item.domain}</span>
            {item.status === 'PARTNER_FOUND' && <span className="board-badge board-badge-status">Partner found</span>}
          </div>
          <div className="board-card-date">{createdAt ? createdAt.toLocaleDateString() : 'Just now'}</div>
        </div>

        <div className="board-card-main">
          <h3 className="board-card-title">{item.title}</h3>
          <p className="board-card-summary">
            {item.publicPitch || (item.explanation ? `${item.explanation.slice(0, 180)}...` : 'Open collaboration thread.')}
          </p>
        </div>

        <div className="board-card-meta">
          <div className="board-meta-item">
            <span className="board-meta-label">Location</span>
            <span className="board-meta-value">
              {item.city ? `${item.city}, ${item.country}` : item.country || 'Remote'}
            </span>
          </div>
          <div className="board-meta-item">
            <span className="board-meta-label">Stage</span>
            <span className="board-meta-value">{item.projectStage ? item.projectStage.replace(/_/g, ' ') : 'CONCEPT'}</span>
          </div>
          <div className="board-meta-item">
            <span className="board-meta-label">Expertise</span>
            <span className="board-meta-value board-meta-truncate" title={item.expertiseNeeded}>
              {item.expertiseNeeded}
            </span>
          </div>
        </div>

        {(isLocalMatch || sharedExpertise.length > 0) && (
          <div className="board-match-strip">
            {isLocalMatch && (
              <span className="board-match-pill">
                <MapPin size={14} />
                Local match
              </span>
            )}
            {sharedExpertise.length > 0 && (
              <span className="board-match-pill board-match-pill-blue">
                <Lightbulb size={14} />
                Shared expertise: {sharedExpertise.join(', ')}
              </span>
            )}
          </div>
        )}

        <div className="board-card-footer">
          <span className="board-footer-chip">{statusLabel}</span>
          <span className="board-footer-link">View details</span>
        </div>
      </Link>
    );
  });

  return (
    <div className="board-shell">
      <header className="board-hero">
        <div className="board-hero-copy">
          <p className="board-hero-kicker">Co-creation board</p>
          <h1 className="board-hero-title">Announcement Board</h1>
          <p className="board-hero-subtitle">
            Find projects that match your specialty, inspect fit fast, and start collaboration without noise.
          </p>
          <div className="board-hero-links">
            <Link href="/board/create" className="board-pill-button">
              <Plus size={18} />
              Post a project
            </Link>
            <a href="#board-results" className="board-hero-anchor">
              Jump to results
            </a>
          </div>
        </div>

        <div className="board-hero-panel">
          <div className="board-hero-panel-row">
            <span className="board-panel-label">Visible projects</span>
            <span className="board-panel-value">{activeCount}</span>
          </div>
          <div className="board-hero-panel-row">
            <span className="board-panel-label">Local matches</span>
            <span className="board-panel-value">{localMatches}</span>
          </div>
          <div className="board-hero-panel-row">
            <span className="board-panel-label">Filters active</span>
            <span className="board-panel-value">{showAdvanced ? 5 : 2}</span>
          </div>
        </div>
      </header>

      <section className="board-toolbar" aria-label="Board filters">
        <div className="board-search">
          <Search size={18} className="board-search-icon" />
          <input
            type="text"
            placeholder="Search projects, context, or expertise"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="board-search-input"
          />
        </div>

        <button className={`board-pill-button board-filter-toggle ${showAdvanced ? 'active' : ''}`} onClick={() => setShowAdvanced(!showAdvanced)}>
          <SlidersHorizontal size={18} />
          {showAdvanced ? 'Hide filters' : 'Advanced filters'}
        </button>
      </section>

      {showAdvanced ? (
        <section className="board-filter-grid">
          <label className="board-filter-field">
            <span>Domain</span>
            <select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)}>
              {domains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </label>
          <label className="board-filter-field">
            <span>Country</span>
            <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </label>
          <label className="board-filter-field">
            <span>City</span>
            <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
          <label className="board-filter-field">
            <span>Stage</span>
            <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage === 'All' ? 'All stages' : stage.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="board-filter-field">
            <span>Status</span>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All projects</option>
              <option value="ACTIVE">Active</option>
              <option value="PARTNER_FOUND">Partner found</option>
            </select>
          </label>
          <label className="board-filter-field">
            <span>Expertise</span>
            <input
              type="text"
              placeholder="e.g. machine learning"
              value={filterExpertise}
              onChange={(e) => setFilterExpertise(e.target.value)}
            />
          </label>
        </section>
      ) : (
        <section className="board-chip-row" aria-label="Popular domains">
          {domains.slice(0, 10).map((domain) => (
            <button
              key={domain}
              onClick={() => setFilterDomain(domain)}
              className={`board-chip ${filterDomain === domain ? 'active' : ''}`}
            >
              {domain === 'All' ? 'All domains' : domain}
            </button>
          ))}
        </section>
      )}

      <section id="board-results" className="board-results">
        {loading ? (
          <div className="board-loading">
            <p className="board-loading-copy">Loading active projects...</p>
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          <div className="board-card-grid">{feedCards}</div>
        ) : (
          <div className="board-empty">
            <SearchX size={42} />
            <p>No projects match current filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
