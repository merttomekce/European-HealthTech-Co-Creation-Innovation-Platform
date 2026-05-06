import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { getUserAnnouncementsByAuthorId } from '@/lib/actions/announcements';
import { getUserProfile } from '@/lib/actions/profile';
import FeedPostCard from '@/components/FeedPostCard';
import ConnectButton from '@/components/ConnectButton';
import '../profile.css';
import './public-profile.css';

function roleLabel(role?: string | null) {
  if (role === 'ENGINEER') return 'Engineer / Tech Expert';
  if (role === 'HEALTHCARE_PROFESSIONAL') return 'Healthcare Professional';
  if (role === 'ADMIN') return 'Administrator';
  return 'Collaborator';
}

function initials(name?: string | null, email?: string | null) {
  if (name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return email ? email.slice(0, 2).toUpperCase() : 'NA';
}

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!currentUser) {
    redirect('/login');
  }

  const [profileRes, postsRes] = await Promise.all([
    getUserProfile(params.id),
    getUserAnnouncementsByAuthorId(params.id),
  ]);

  if (!profileRes.success || !profileRes.data) {
    redirect('/dashboard');
  }

  const profile = profileRes.data;
  const posts = postsRes.success ? postsRes.data || [] : [];
  const isOwnProfile = currentUser.id === profile.id;
  const isConnected = isOwnProfile
    ? true
    : Boolean(
        await prisma.connection.findFirst({
          where: {
            OR: [
              { user1Id: currentUser.id, user2Id: profile.id },
              { user1Id: profile.id, user2Id: currentUser.id },
            ],
          },
          select: { id: true },
        })
      );

  const location = [profile.city, profile.country].filter(Boolean).join(', ') || 'Location not shared';
  const joinedAt = new Date(profile.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' });
  const memberPosts = posts.length;
  const connectionsCount = await prisma.connection.count({
    where: {
      OR: [
        { user1Id: profile.id },
        { user2Id: profile.id },
      ],
    },
  });

  return (
    <div className="public-profile-page">
      <section className="public-profile-hero">
        <Link href="/dashboard" className="public-profile-back">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to feed
        </Link>

        <div className="public-profile-header">
          <div className="public-profile-avatar">
            {profile.image ? (
              <img src={profile.image} alt={profile.name || 'Profile avatar'} />
            ) : (
              <span>{initials(profile.name, profile.email)}</span>
            )}
          </div>

          <div className="public-profile-heading">
            <p className="public-profile-kicker">Member profile</p>
            <h1 className="public-profile-name">{profile.name || 'Anonymous user'}</h1>
            <div className="public-profile-meta">
              <span>{roleLabel(profile.role)}</span>
              <span>{profile.institution || 'Institution not shared'}</span>
              <span>{location}</span>
            </div>
            <p className="public-profile-bio-snippet">
              {profile.bio || 'No bio added yet. This person has not filled out a public summary.'}
            </p>
          </div>
        </div>

        <div className="public-profile-actions">
          <ConnectButton
            targetUserId={profile.id}
            initialConnected={isConnected}
            isOwnProfile={isOwnProfile}
          />
          <a href="#posts" className="public-profile-button public-profile-button--ghost">
            View posts
          </a>
        </div>
      </section>

      <section className="public-profile-stats">
        <div className="public-profile-stat">
          <span>Posts</span>
          <strong>{memberPosts.toString().padStart(2, '0')}</strong>
        </div>
        <div className="public-profile-stat">
          <span>Connections</span>
          <strong>{connectionsCount.toString().padStart(2, '0')}</strong>
        </div>
        <div className="public-profile-stat">
          <span>Member since</span>
          <strong>{joinedAt}</strong>
        </div>
        <div className="public-profile-stat">
          <span>Status</span>
          <strong>{isConnected ? 'Connected' : 'Open to connect'}</strong>
        </div>
      </section>

      <section className="public-profile-grid">
        <main className="public-profile-main">
          <article className="public-profile-card">
            <div className="public-profile-section-head">
              <p>Bio</p>
              <h2>About this member</h2>
            </div>
            <p className="public-profile-copy">
              {profile.bio || 'This member has not written a public biography yet.'}
            </p>
          </article>

          <article className="public-profile-card">
            <div className="public-profile-section-head">
              <p>Expertise</p>
              <h2>Skills and focus areas</h2>
            </div>
            <div className="public-profile-tag-list">
              {profile.expertise && profile.expertise.length > 0 ? (
                profile.expertise.map((tag) => (
                  <span key={tag} className="public-profile-tag">{tag}</span>
                ))
              ) : (
                <span className="public-profile-empty">No expertise tags shared.</span>
              )}
            </div>
          </article>

          <article className="public-profile-card" id="posts">
            <div className="public-profile-section-head">
              <p>Posts</p>
              <h2>Recent collaboration posts</h2>
            </div>

            {posts.length > 0 ? (
              <div className="public-profile-post-list">
                {posts.map((post) => (
                  <FeedPostCard
                    key={post.id}
                    announcement={post}
                    currentUserId={currentUser.id}
                    roleTone={profile.role === 'ENGINEER' ? 'engineer' : 'doctor'}
                  />
                ))}
              </div>
            ) : (
              <div className="public-profile-empty-state">
                No posts published yet.
              </div>
            )}
          </article>
        </main>

        <aside className="public-profile-side">
          <article className="public-profile-card">
            <div className="public-profile-section-head">
              <p>Details</p>
              <h2>Public info</h2>
            </div>
            <div className="public-profile-detail-list">
              <div className="public-profile-detail-row">
                <span>Institution</span>
                <strong>{profile.institution || 'Not shared'}</strong>
              </div>
              <div className="public-profile-detail-row">
                <span>Location</span>
                <strong>{location}</strong>
              </div>
              <div className="public-profile-detail-row">
                <span>Role</span>
                <strong>{roleLabel(profile.role)}</strong>
              </div>
              <div className="public-profile-detail-row">
                <span>Joined</span>
                <strong>{joinedAt}</strong>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}
