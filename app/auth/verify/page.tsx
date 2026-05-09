'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { sendEmailVerificationCode, verifyEmailCode } from '@/lib/auth-email-otp';
import '../auth.css';
import '../auth-v2.css';

function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams.get('email') || '').trim().toLowerCase();
  const nextPath = searchParams.get('next') || '/auth/register';
  const preSent = searchParams.get('sent') === '1';
  const supabase = React.useMemo(() => createClient(), []);
  const [code, setCode] = React.useState('');
  const [banner, setBanner] = React.useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isSending, setIsSending] = React.useState(true);
  const [isResending, setIsResending] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);

  React.useEffect(() => {
    if (!email) {
      router.replace('/login');
    }
  }, [email, router]);

  React.useEffect(() => {
    let active = true;

    async function sendCode() {
      if (!email) return;

      setIsSending(true);
      setBanner(null);

      try {
        await sendEmailVerificationCode(supabase, email);
        if (!active) return;
        setBanner({
          type: 'success',
          text: `Verification code sent to ${email}.`,
        });
      } catch (error: any) {
        if (!active) return;
        setBanner({
          type: 'error',
          text: error?.message || 'Could not send verification code.',
        });
      } finally {
        if (active) setIsSending(false);
      }
    }

    if (preSent) {
      setIsSending(false);
      setBanner({
        type: 'success',
        text: `Verification code sent to ${email}.`,
      });
    } else {
      sendCode();
    }

    return () => {
      active = false;
    };
  }, [email, supabase, preSent]);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setBanner(null);
    setIsVerifying(true);

    try {
      await verifyEmailCode(supabase, email, code);
      router.replace(`${nextPath}${nextPath.includes('?') ? '&' : '?'}email=${encodeURIComponent(email)}&verified=1`);
      router.refresh();
    } catch (error: any) {
      setBanner({
        type: 'error',
        text: error?.message || 'Invalid code.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setBanner(null);

    try {
      await sendEmailVerificationCode(supabase, email);
      setBanner({
        type: 'success',
        text: `New code sent to ${email}.`,
      });
    } catch (error: any) {
      setBanner({
        type: 'error',
        text: error?.message || 'Could not resend verification code.',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="auth-v2-container">
      <aside className="auth-v2-brand-side">
        <div className="auth-v2-brand-content">
          <h1>Clinical Needs.<br />Engineering Solutions.</h1>
          <p>
            Enter code sent to email. Then registration opens.
          </p>
        </div>

        <div className="auth-v2-trust-list">
          <div className="auth-v2-trust-item">
            <span className="auth-v2-trust-icon"><Mail size={16} aria-hidden="true" /></span>
            <div>
              <strong>Code delivery</strong>
              <span>Single-use code lands in inbox before profile setup.</span>
            </div>
          </div>
          <div className="auth-v2-trust-item">
            <span className="auth-v2-trust-icon"><ShieldCheck size={16} aria-hidden="true" /></span>
            <div>
              <strong>Verified access</strong>
              <span>Registration waits until email proof is done.</span>
            </div>
          </div>
          <div className="auth-v2-trust-item">
            <span className="auth-v2-trust-icon"><CheckCircle2 size={16} aria-hidden="true" /></span>
            <div>
              <strong>Direct handoff</strong>
              <span>Verification unlocks registration without extra stop.</span>
            </div>
          </div>
        </div>

        <div className="auth-v2-brand-footer">
          Secure institutional access. Shared project space.
        </div>
      </aside>

      <section className="auth-v2-form-side">
        <div className="auth-v2-form-card">
          <div className="auth-v2-eyebrow">Email verification</div>
          <h2 className="auth-v2-title">Enter code</h2>

          {banner && <div className={`auth-v2-banner ${banner.type}`}>{banner.text}</div>}

          <div className="auth-v2-help">Email</div>
          <div className="auth-v2-email-chip">{email || 'No email found'}</div>

          <form className="auth-v2-form" onSubmit={handleVerify}>
            <div className="auth-v2-group">
              <label className="auth-v2-label">Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="auth-v2-input"
                placeholder="123456"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-v2-btn" disabled={isSending || isVerifying || !email}>
              {isVerifying ? 'Verifying...' : isSending ? 'Sending code...' : 'Verify code'}
            </button>
          </form>

          <div className="auth-v2-switch">
            <button type="button" onClick={handleResend} disabled={isSending || isResending || !email}>
              {isResending ? 'Resending...' : 'Resend code'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function VerifyRoute() {
  return (
    <React.Suspense fallback={<div className="auth-v2-container">Loading...</div>}>
      <VerifyPage />
    </React.Suspense>
  );
}
