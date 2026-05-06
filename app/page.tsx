'use client';

import Link from 'next/link';
import type { ComponentType } from 'react';
import { ArrowRight, Search, Shield, Users, Layers } from 'lucide-react';

const projects = [
  {
    specialty: 'critical care',
    title: 'Sepsis early warning',
    collaborators: '16 collaborators',
    badge: 'recruiting',
  },
  {
    specialty: 'nephrology',
    title: 'Home dialysis companion',
    collaborators: '9 collaborators',
    badge: 'pilot',
  },
  {
    specialty: 'emergency medicine',
    title: 'Triage note assistant',
    collaborators: '24 collaborators',
    badge: 'running',
  },
  {
    specialty: 'neurology',
    title: 'Stroke rehab tracker',
    collaborators: '12 collaborators',
    badge: 'recruiting',
  },
  {
    specialty: 'radiology',
    title: 'Clinical imaging QA',
    collaborators: '8 collaborators',
    badge: 'review',
  },
  {
    specialty: 'operations',
    title: 'Ward capacity forecast',
    collaborators: '19 collaborators',
    badge: 'pilot',
  },
];

const features = [
  {
    icon: Shield,
    title: 'Verified institutions',
    text: 'Trusted access for hospitals, labs, and engineering teams that need a shared workspace.',
  },
  {
    icon: Users,
    title: 'Matched collaborators',
    text: 'Find clinicians, engineers, and researchers who work on the same problem from different angles.',
  },
  {
    icon: Layers,
    title: 'Project workspace',
    text: 'Move from need to pilot without leaving the platform or losing the context around a problem.',
  },
];

function ProjectCard({
  specialty,
  title,
  collaborators,
  badge,
}: {
  specialty: string;
  title: string;
  collaborators: string;
  badge: string;
}) {
  return (
    <article
      style={{
        borderRadius: 28,
        overflow: 'hidden',
        border: '1px solid rgba(72, 92, 129, 0.22)',
        background: 'rgba(255,255,255,0.88)',
        boxShadow: '0 18px 50px rgba(93, 112, 153, 0.22)',
        minHeight: 336,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          aspectRatio: '1 / 1',
          background:
            'radial-gradient(circle at 28% 24%, rgba(247, 232, 238, 0.92) 0%, rgba(247, 232, 238, 0.2) 18%, transparent 36%), linear-gradient(135deg, #dde8fb 0%, #c7d6ee 42%, #8da2c3 100%)',
          borderBottom: '1px solid rgba(72, 92, 129, 0.14)',
        }}
      />
      <div style={{ padding: '1rem 1.1rem 1.15rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(20, 20, 19, 0.62)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {specialty}
        </div>
        <div style={{ marginTop: '0.45rem', fontSize: '1.1rem', lineHeight: 1.2, fontWeight: 800, color: 'var(--on-background)' }}>
          {title}
        </div>
        <div style={{ marginTop: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <span style={{ color: 'rgba(20, 20, 19, 0.62)', fontSize: '0.9rem' }}>{collaborators}</span>
          <span
            style={{
              borderRadius: 999,
              padding: '0.34rem 0.7rem',
              background: 'rgba(77, 113, 255, 0.12)',
              color: '#2846a8',
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {badge}
          </span>
        </div>
      </div>
    </article>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  text,
}: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        borderRadius: 24,
        border: '1px solid rgba(72, 92, 129, 0.16)',
        background: 'rgba(255,255,255,0.84)',
        padding: '1.1rem',
        boxShadow: '0 10px 30px rgba(93, 112, 153, 0.12)',
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(77, 113, 255, 0.1)',
          color: '#385fd2',
        }}
      >
        <Icon size={20} />
      </div>
      <div style={{ marginTop: '0.9rem', fontSize: '1.02rem', fontWeight: 800, color: 'var(--on-background)' }}>
        {title}
      </div>
      <p style={{ marginTop: '0.45rem', color: 'rgba(20, 20, 19, 0.66)', lineHeight: 1.55, fontSize: '0.95rem' }}>
        {text}
      </p>
    </div>
  );
}

export default function Page() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 20% 20%, rgba(235, 222, 241, 0.98) 0%, rgba(235, 222, 241, 0.58) 16%, transparent 34%), radial-gradient(circle at 92% 8%, rgba(195, 217, 251, 0.92) 0%, rgba(195, 217, 251, 0.42) 16%, transparent 34%), linear-gradient(135deg, #f8fbff 0%, #e7eff9 48%, #b5c8de 100%)',
        color: 'var(--on-background)',
      }}
    >
      <div style={{ width: 'min(1440px, calc(100% - 2rem))', margin: '0 auto', padding: '1rem 0 2rem' }}>
        <header
          style={{
            position: 'sticky',
            top: '1rem',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '0.8rem 1rem',
            borderRadius: 999,
            border: '1px solid rgba(72, 92, 129, 0.16)',
            background: 'rgba(255,255,255,0.86)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 14px 36px rgba(93, 112, 153, 0.12)',
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontWeight: 800, fontSize: '1.05rem' }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, #d7e6fb 0%, #90abcf 100%)',
                color: '#fff',
              }}
            >
              h
            </span>
            HealthAI
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'rgba(20,20,19,0.78)', fontWeight: 700 }}>
            <a href="#projects">Projects</a>
            <a href="#network">Network</a>
            <a href="#manifesto">Manifesto</a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <button
              type="button"
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                border: '1px solid rgba(72, 92, 129, 0.16)',
                background: 'rgba(255,255,255,0.9)',
                display: 'grid',
                placeItems: 'center',
                color: 'rgba(20,20,19,0.72)',
              }}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <Link href="/login" style={{ fontWeight: 700, color: 'rgba(20,20,19,0.78)' }}>
              Sign in
            </Link>
            <Link
              href="/login"
              style={{
                padding: '0.8rem 1.15rem',
                borderRadius: 999,
                background: '#171717',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              Get started
            </Link>
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '2rem',
            alignItems: 'start',
            padding: '2rem 0 1.5rem',
          }}
        >
          <div style={{ paddingTop: '1.2rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(20, 20, 19, 0.56)' }}>
              Step 01. Identity
            </div>
            <h1 style={{ marginTop: '1rem', fontSize: 'clamp(3.6rem, 6vw, 6.5rem)', lineHeight: 0.92, letterSpacing: '-0.05em', fontWeight: 800, color: 'var(--on-background)' }}>
              Build clinical AI with people who know the problem.
            </h1>
            <p style={{ marginTop: '1.4rem', maxWidth: 620, fontSize: '1.2rem', lineHeight: 1.45, color: 'rgba(20, 20, 19, 0.68)' }}>
              A curated network for healthcare professionals and engineers to find relevant projects, share context, and co-create practical medical tools.
            </p>

            <div style={{ marginTop: '1.7rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', padding: '0.92rem 1.15rem', borderRadius: 999, background: '#111827', color: '#fff', fontWeight: 700 }}>
                Join the network <ArrowRight size={18} />
              </Link>
              <a href="#projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', padding: '0.92rem 1.15rem', borderRadius: 999, border: '1px solid rgba(72, 92, 129, 0.22)', background: 'rgba(255,255,255,0.64)', color: 'var(--on-background)', fontWeight: 700 }}>
                Explore projects
              </a>
            </div>

            <div
              id="network"
              style={{
                marginTop: '2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '1rem',
              }}
            >
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '1rem',
                alignItems: 'start',
              }}
            >
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(20, 20, 19, 0.56)' }}>
                  Step 02. Projects
                </div>
                <h2 style={{ marginTop: '0.85rem', fontSize: 'clamp(2rem, 3vw, 3.4rem)', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 800 }}>
                  Verified institutional entry
                </h2>
              </div>
              {projects.map((project) => (
                <ProjectCard key={project.title} {...project} />
              ))}
            </div>
          </div>
        </section>

        <section
          id="manifesto"
          style={{
            marginTop: '2rem',
            padding: '1.4rem 1.5rem',
            borderRadius: 30,
            background: 'rgba(255,255,255,0.72)',
            border: '1px solid rgba(72, 92, 129, 0.16)',
            boxShadow: '0 18px 40px rgba(93, 112, 153, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(20, 20, 19, 0.56)' }}>
              Step 03. Manifesto
            </div>
            <div style={{ marginTop: '0.55rem', fontSize: '1.2rem', fontWeight: 800 }}>
              Open healthcare collaboration, built for real work.
            </div>
          </div>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', padding: '0.9rem 1.1rem', borderRadius: 999, background: '#111827', color: '#fff', fontWeight: 700 }}>
            Get started <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </main>
  );
}
