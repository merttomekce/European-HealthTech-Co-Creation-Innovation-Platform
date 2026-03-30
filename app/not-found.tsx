'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background)',
      color: 'var(--on-background)',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '600px' }}>
        <h1 className="text-serif" style={{ fontSize: '6rem', color: '#ef4444', marginBottom: '1rem', letterSpacing: '-0.05em' }}>
          404
        </h1>
        <h2 style={{ fontSize: '2rem', fontWeight: 500, marginBottom: '2rem', letterSpacing: '-0.02em', color: 'var(--on-background)' }}>
          Signal Lost
        </h2>
        <p style={{ fontSize: '1.125rem', color: 'var(--on-background-muted)', marginBottom: '3rem', lineHeight: 1.6 }}>
          The requested node could not be located in the neural registry. It may have been archived, transferred, or never existed.
        </p>
        <Link 
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 2rem',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--outline)',
            borderRadius: '99px',
            color: 'var(--on-background)',
            fontSize: '1rem',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            textDecoration: 'none'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.borderColor = 'var(--outline)';
          }}
        >
          <span className="material-symbols-outlined">restart_alt</span>
          Return to Dashboard
        </Link>
      </div>

      {/* Decorative Grid Element */}
      <div 
        className="bg-health-grid"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0.15,
          pointerEvents: 'none',
          zIndex: 0,
          maskImage: 'radial-gradient(circle at center, black 0%, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 60%)',
        }}
      />
    </div>
  );
}
