'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Captured by global boundary:', error);
  }, [error]);

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
      <div style={{ maxWidth: '600px', backgroundColor: 'var(--surface)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--outline)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1.5rem' }}>
          warning
        </span>
        <h2 className="text-serif" style={{ fontSize: '2rem', fontWeight: 500, marginBottom: '1rem', letterSpacing: '-0.02em', color: 'var(--on-background)' }}>
          System Exception
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--on-background-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          We encountered an unexpected anomaly while processing your request. Please retry the operation. If the issue persists, the engineering team has been notified.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => reset()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.875rem 2rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--outline)',
              borderRadius: '99px',
              color: 'var(--on-background)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
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
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>refresh</span>
            Attempt Recovery
          </button>
        </div>
      </div>
    </div>
  );
}
