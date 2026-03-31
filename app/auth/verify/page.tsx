'use client';

import React from 'react';
import Link from 'next/link';
import '../auth.css';

export default function VerifyPage() {
  // Simulating an email from the query string or state
  const email = "sarah.chen@charite.de";

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-icon material-symbols-outlined">mark_email_unread</div>
        <h1 className="auth-title">Verify your email</h1>
        <p className="auth-description">
          We've sent a magic link to 
          <span className="auth-email-highlight">{email}</span>.
          Click the link in your inbox to complete your registration.
        </p>

        <button className="auth-action-btn" onClick={() => alert("Verification link resent.")}>
          Resend magic link
        </button>

        <div className="auth-secondary-info">
          Wrong email? <Link href="/">Change it here</Link>
        </div>
        
        <div className="auth-secondary-info" style={{ marginTop: '0.5rem' }}>
          <Link href="/auth/complete-profile">Skip to onboarding (Development Only)</Link>
        </div>
      </div>
    </div>
  );
}
