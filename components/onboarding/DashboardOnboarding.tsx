import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export default function DashboardOnboarding({ role }: { role: 'doctor' | 'engineer' }) {
  const title = role === 'doctor' ? 'Set up your clinical desk' : 'Set up your build desk';

  return (
    <section className="dashboard-onboarding">
      <div className="dashboard-onboarding-copy">
        <div className="dashboard-onboarding-kicker">Onboarding</div>
        <h2>{title}</h2>
        <p>
          Finish your profile to unlock matching, requests, and the right role-specific workflow.
        </p>
      </div>

      <div className="dashboard-onboarding-actions">
        <Link href="/profile" className="dashboard-onboarding-primary">
          Complete profile <ArrowRight size={18} />
        </Link>
        <div className="dashboard-onboarding-list">
          <span><CheckCircle2 size={15} /> Verified account</span>
          <span><Sparkles size={15} /> Better matches</span>
        </div>
      </div>
    </section>
  );
}
