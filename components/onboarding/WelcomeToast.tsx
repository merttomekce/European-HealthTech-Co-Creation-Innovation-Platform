'use client';

import React from 'react';
import { X } from 'lucide-react';

export default function WelcomeToast() {
  const [visible, setVisible] = React.useState(true);
  if (!visible) return null;

  return (
    <div className="welcome-toast">
      <div>
        <strong>Welcome back.</strong>
        <div>Build, review, and connect from the same workspace.</div>
      </div>
      <button type="button" onClick={() => setVisible(false)} aria-label="Dismiss welcome">
        <X size={16} />
      </button>
    </div>
  );
}
