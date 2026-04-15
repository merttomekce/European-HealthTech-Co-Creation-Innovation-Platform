'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, SearchX } from 'lucide-react';
import { getAnnouncements } from '@/lib/actions/announcements';
import { useRealtime } from '@/lib/hooks/useRealtime';
import { createClient } from '@/lib/supabase/client';

export default function BoardPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string>();

  // Use real-time sync
  useRealtime(userId);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      
      const result = await getAnnouncements();
      if (result.success) {
        setAnnouncements(result.data || []);
      }
      setLoading(false);
    }
    init();
  }, []);

  const domains: string[] = useMemo(() => {
    const d = new Set(announcements.map(a => a.domain));
    return ['All', ...Array.from(d)];
  }, [announcements]);

  const filteredAnnouncements: any[] = useMemo(() => {
    return announcements.filter(a => {
      const matchesFilter = activeFilter === 'All' || a.domain === activeFilter;
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (a.publicPitch?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery, announcements]);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="text-serif" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Announcement Board</h1>
          <p className="subtext">Connect with interdisciplinary peers to co-create the future of healthcare.</p>
        </div>
        <Link href="/board/create" className="btn-primary" style={{ textDecoration: 'none', background: 'var(--on-background)', color: 'var(--background)', padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} />
          Post a Project
        </Link>
      </header>

      {/* Search & Filter Bar */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
          <div style={{ 
            position: 'absolute', 
            left: '1rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'var(--on-background-muted)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              background: 'var(--surface)', 
              border: '1px solid var(--outline)', 
              borderRadius: '999px',
              padding: '0.75rem 1rem 0.75rem 3rem',
              color: 'var(--on-background)',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {domains.map(domain => (
            <button 
              key={domain}
              onClick={() => setActiveFilter(domain)}
              style={{ 
                padding: '0.6rem 1.5rem', 
                borderRadius: '999px', 
                background: activeFilter === domain ? 'var(--on-background)' : 'var(--surface-raised)',
                color: activeFilter === domain ? 'var(--background)' : 'var(--on-background-muted)',
                border: '1px solid',
                borderColor: activeFilter === domain ? 'var(--on-background)' : 'var(--outline)',
                fontSize: '0.875rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {domain === 'All' ? 'All Domains' : domain}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '6rem' }}>
             <p className="subtext">Loading active projects...</p>
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((item) => (
            <div 
              key={item.id} 
              style={{ 
                background: 'var(--surface)', 
                borderRadius: '24px', 
                padding: '2rem',
                border: '1px solid var(--outline)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--on-background-muted)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--outline)';
                e.currentTarget.style.backgroundColor = 'var(--surface)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.06em',
                      color: item.author?.role === 'ENGINEER' ? '#3FABFC' : '#059669',
                      background: item.author?.role === 'ENGINEER' ? 'rgba(63, 171, 252, 0.1)' : 'rgba(5, 150, 105, 0.1)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px'
                    }}>
                      {item.author?.role === 'ENGINEER' ? 'Engineer' : 'Healthcare'}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--on-background-muted)', fontWeight: 500 }}>{item.author?.institution}</span>
                  </div>
                  <h3 className="text-serif" style={{ fontSize: '1.75rem', fontWeight: 400, letterSpacing: '-0.01em' }}>{item.title}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--on-background-muted)' }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now'}
                  </span>
                </div>
              </div>

              <p style={{ 
                fontSize: '1.125rem', 
                color: 'var(--on-background-muted)', 
                lineHeight: 1.6, 
                marginBottom: '2.5rem',
                maxWidth: '840px'
              }}>
                {item.publicPitch || item.explanation?.slice(0, 180) + '...'}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', borderTop: '1px solid var(--outline)', paddingTop: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--on-background-muted)', marginBottom: '0.35rem' }}>Domain</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{item.domain}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--on-background-muted)', marginBottom: '0.35rem' }}>Stage</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{item.projectStage ? item.projectStage.replace(/_/g, ' ') : 'CONCEPT'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--on-background-muted)', marginBottom: '0.35rem' }}>Commitment</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{item.commitmentLevel}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <Link href={`/board/${item.id}`}>
                    <button style={{ 
                      background: 'var(--on-background)', 
                      color: 'var(--background)',
                      border: 'none',
                      padding: '0.75rem 2rem',
                      borderRadius: '999px',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'opacity 0.2s ease'
                    }}>
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--on-background-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <SearchX size={48} style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.25rem' }}>No projects match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
