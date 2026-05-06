'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import ProfilePage from '@/app/(protected)/profile/page';
import '@/app/(protected)/board/project-detail.css';

export default function ProfileModalPage() {
  const router = useRouter();

  return (
    <div className="detail-modal-shell profile-modal-shell">
      <div className="detail-modal-surface profile-modal-surface">
        <div className="detail-modal-header">
          <h2 className="profile-modal-title">Profile Settings</h2>
          <button
            type="button"
            className="detail-modal-close"
            aria-label="Close settings"
            onClick={() => router.back()}
          >
            <X size={18} />
          </button>
        </div>

        <div className="profile-modal-content">
          <ProfilePage isModal={true} />
        </div>
      </div>

      <style jsx>{`
        .profile-modal-shell {
          background: radial-gradient(circle at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.95) 100%);
          z-index: 10000;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .profile-modal-surface {
          max-width: 860px;
          height: calc(100vh - 4rem);
          display: flex;
          flex-direction: column;
          animation: profile-modal-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes profile-modal-up {
          0% { transform: translateY(100%) scale(0.98); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .profile-modal-title {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          font-weight: 500;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .profile-modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          scrollbar-width: none;
        }
        .profile-modal-content::-webkit-scrollbar {
          display: none;
        }
        :global(.profile-modal-content .profile-container) {
          max-width: 100% !important;
          padding: 0 !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}
