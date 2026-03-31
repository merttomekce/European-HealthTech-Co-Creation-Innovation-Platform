'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import CustomCheckbox from './CustomCheckbox';
import { requestMeeting } from '@/lib/actions/meetings';
import { CheckCircle } from 'lucide-animated';

interface InterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

export default function InterestModal({ isOpen, onClose, projectId, projectTitle }: InterestModalProps) {
  const [acceptedNDA, setAcceptedNDA] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedNDA) return;
    
    setIsSubmitting(true);
    setError(null);
    
    const result = await requestMeeting(projectId, message);

    if (result.success) {
      setIsSuccess(true);
    } else {
      setError(result.error || 'Failed to send request');
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="modal-header" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            color: '#059669', 
            marginBottom: '1rem',
            background: 'rgba(5, 150, 105, 0.1)',
            padding: '1.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={64} animate={true} />
          </div>
          <h2 style={{ fontSize: '2.5rem' }}>Interest Expressed</h2>
          <p style={{ marginBottom: '2rem' }}>
            We've notified the project lead. You can now view this project in 
            your "My Requests" dashboard once they respond.
          </p>
          <button 
            className="modal-submit-btn" 
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h2 style={{ fontSize: '1.5rem', color: 'var(--on-background-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>Express Interest</h2>
        <h2>{projectTitle}</h2>
        <p>Send a brief message to the project lead. Your professional profile will be shared automatically.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="modal-form-group">
          <textarea
            className="modal-textarea"
            placeholder="Introduce yourself and explain why you're interested in this project..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        {error && (
          <div style={{ color: '#EF4444', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div className="modal-legal-box">
          <CustomCheckbox 
            id="nda"
            label="I accept the Non-Disclosure Agreement (NDA) and terms of interdisciplinary collaboration. I understand that any proprietary medical or technical data shared during this process is confidential."
            checked={acceptedNDA}
            onChange={(checked) => setAcceptedNDA(checked)}
          />
        </div>

        <button 
          type="submit" 
          className="modal-submit-btn"
          disabled={!acceptedNDA || isSubmitting}
        >
          {isSubmitting ? 'Sending Request...' : 'Send Expression of Interest'}
        </button>
      </form>
    </Modal>
  );
}
