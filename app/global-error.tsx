'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '1.5rem', background: 'linear-gradient(180deg, #f7fbff 0%, #ffffff 18%, #ffffff 100%)', color: 'var(--on-background)' }}>
          <section style={{ width: 'min(100%, 760px)', padding: '2rem', borderRadius: '32px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.96)', boxShadow: '0 24px 56px rgba(27, 39, 51, 0.07)' }}>
            <div className="section-kicker">Critical error</div>
            <h1 style={{ marginTop: '0.5rem', fontSize: 'clamp(2.6rem, 6vw, 4.2rem)', lineHeight: 0.96, letterSpacing: '-0.05em', fontWeight: 800 }}>
              App boundary tripped
            </h1>
            <p style={{ marginTop: '0.9rem', maxWidth: '46rem', color: 'var(--on-background-muted)', lineHeight: 1.7 }}>
              Refresh to retry or return to home. If this keeps happening, the route needs a code fix.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <button type="button" onClick={reset} className="pill-button" style={{ cursor: 'pointer' }}>
                <RefreshCw size={18} />
                Retry
              </button>
              <Link href="/" className="pill-button-secondary">
                <ArrowLeft size={18} />
                Back home
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
