'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, SearchX, SlidersHorizontal, MapPin, Lightbulb } from 'lucide-react';
import { getAnnouncements } from '@/lib/actions/announcements';
import { getAuthProfile } from '@/lib/actions/profile';
import { useRealtime } from '@/lib/hooks/useRealtime';
import { createClient } from '@/lib/supabase/client';

export default function BoardPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string>();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState<string>('All');
  const [filterCity, setFilterCity] = useState<string>('All');
  const [filterCountry, setFilterCountry] = useState<string>('All');
  const [filterStage, setFilterStage] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE');
  const [filterExpertise, setFilterExpertise] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Use real-time sync
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

  // Compute options for dropdowns dynamically from active dataset
  const { domains, cities, countries, stages } = useMemo(() => {
    const d = new Set<string>();
    const ci = new Set<string>();
    const co = new Set<string>();
    const st = new Set<string>();
    
    announcements.forEach(a => {
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

  const filteredAnnouncements: any[] = useMemo(() => {
    return announcements.filter(a => {
      // Basic Search
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (a.publicPitch?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                            (a.explanation?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      // Exact Matches
      const matchesDomain = filterDomain === 'All' || a.domain === filterDomain;
      const matchesCity = filterCity === 'All' || a.city === filterCity;
      const matchesCountry = filterCountry === 'All' || a.country === filterCountry;
      const matchesStage = filterStage === 'All' || a.projectStage === filterStage;
      const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
      
      // Expertise Match
      let matchesExpertise = true;
      if (filterExpertise.trim() !== '') {
        matchesExpertise = (a.expertiseNeeded || '').toLowerCase().includes(filterExpertise.toLowerCase());
      }

      return matchesSearch && matchesDomain && matchesCity && matchesCountry && matchesStage && matchesStatus && matchesExpertise;
    });
  }, [filterDomain, filterCity, filterCountry, filterStage, filterStatus, filterExpertise, searchQuery, announcements]);

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

      {/* Search & Filter Section */}
      <div style={{ marginBottom: '3rem', background: 'var(--surface-raised)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--outline)' }}>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
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
          
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ 
              background: showAdvanced ? 'var(--on-background)' : 'var(--surface)',
              color: showAdvanced ? 'var(--background)' : 'var(--on-background)',
              border: `1px solid ${showAdvanced ? 'var(--on-background)' : 'var(--outline)'}`,
              padding: '0 1.5rem',
              borderRadius: '999px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'all 0.2s ease'
            }}
          >
            <SlidersHorizontal size={18} />
            {showAdvanced ? 'Hide Filters' : 'Advanced Filters'}
          </button>
        </div>

        {/* Collapsible Filters */}
        {showAdvanced && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--outline)' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>Domain</label>
              <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--outline)', background: 'var(--surface)', color: 'var(--on-background)' }}>
                {domains.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>Country</label>
              <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--outline)', background: 'var(--surface)', color: 'var(--on-background)' }}>
                {countries.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>City</label>
              <select value={filterCity} onChange={e => setFilterCity(e.target.value)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--outline)', background: 'var(--surface)', color: 'var(--on-background)' }}>
                {cities.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>Project Stage</label>
              <select value={filterStage} onChange={e => setFilterStage(e.target.value)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--outline)', background: 'var(--surface)', color: 'var(--on-background)' }}>
                {stages.map(d => <option key={d} value={d}>{d === 'All' ? 'All' : d.replace(/_/g, ' ')}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--outline)', background: 'var(--surface)', color: 'var(--on-background)' }}>
                <option value="All">All Projects</option>
                <option value="ACTIVE">Active (Seeking Partners)</option>
                <option value="PARTNER_FOUND">Partner Found</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>Required Expertise</label>
              <input 
                type="text" 
                placeholder="e.g. Machine Learning" 
                value={filterExpertise} 
                onChange={e => setFilterExpertise(e.target.value)} 
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--outline)', background: 'var(--surface)', color: 'var(--on-background)' }}
              />
            </div>
          </div>
        )}

        {/* Quick Filter Bubbles (Domain) */}
        {!showAdvanced && (
           <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--outline)' }}>
             {domains.slice(0, 10).map(domain => (
               <button 
                 key={domain}
                 onClick={() => setFilterDomain(domain)}
                 style={{ 
                   padding: '0.4rem 1.25rem', 
                   borderRadius: '999px', 
                   background: filterDomain === domain ? 'var(--on-background)' : 'var(--surface)',
                   color: filterDomain === domain ? 'var(--background)' : 'var(--on-background-muted)',
                   border: '1px solid',
                   borderColor: filterDomain === domain ? 'var(--on-background)' : 'var(--outline)',
                   fontSize: '0.8rem',
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
        )}
      </div>

      {/* Announcements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '6rem' }}>
             <p className="subtext">Loading active projects...</p>
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((item) => {
            // Intelligent Matching Logic
            const isLocalMatch = userProfile?.city && item.city && (item.city.toLowerCase() === userProfile.city.toLowerCase());
            
            let sharedExpertise: string[] = [];
            if (userProfile?.expertise && Array.isArray(userProfile.expertise) && item.expertiseNeeded) {
              const itemReqs = item.expertiseNeeded.toLowerCase();
              sharedExpertise = userProfile.expertise.filter((skill: string) => itemReqs.includes(skill.toLowerCase()));
            }

            return (
            <div 
              key={item.id} 
              style={{ 
                background: 'var(--surface)', 
                borderRadius: '24px', 
                padding: '2rem',
                border: '1px solid',
                borderColor: isLocalMatch || sharedExpertise.length > 0 ? 'var(--primary)' : 'var(--outline)',
                boxShadow: isLocalMatch || sharedExpertise.length > 0 ? '0 8px 30px rgba(0, 0, 0, 0.04)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.backgroundColor = 'var(--surface)';
              }}
            >
              {/* Intelligent Match Badges */}
              {(isLocalMatch || sharedExpertise.length > 0) && (
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  {isLocalMatch && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(5, 150, 105, 0.1)', color: '#059669', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                      <MapPin size={14} /> Local Match ({item.city})
                    </div>
                  )}
                  {sharedExpertise.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(63, 171, 252, 0.1)', color: '#3FABFC', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                      <Lightbulb size={14} /> Shared Expertise: {sharedExpertise.join(', ')}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.06em',
                      color: item.author?.role === 'ENGINEER' ? '#059669' : '#3FABFC',
                      background: item.author?.role === 'ENGINEER' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(63, 171, 252, 0.1)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px'
                    }}>
                      Looking for {item.author?.role === 'ENGINEER' ? 'Healthcare' : 'Engineer'}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--on-background-muted)', fontWeight: 500 }}>{item.author?.institution}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--on-background-muted)', fontWeight: 500 }}>•  {item.city}, {item.country}</span>
                  </div>
                  <h3 className="text-serif" style={{ fontSize: '1.75rem', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '0.5rem' }}>
                    {item.title}
                  </h3>
                  {item.status === 'PARTNER_FOUND' && (
                    <span style={{ display: 'inline-block', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', color: '#10B981', border: '1px solid #10B981', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>Partner Found</span>
                  )}
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
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--on-background-muted)', marginBottom: '0.35rem' }}>Required Expertise</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.expertiseNeeded}>{item.expertiseNeeded}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--on-background-muted)', marginBottom: '0.35rem' }}>Stage</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{item.projectStage ? item.projectStage.replace(/_/g, ' ') : 'CONCEPT'}</div>
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
            );
          })
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
