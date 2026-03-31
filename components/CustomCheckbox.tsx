'use client';

import React from 'react';

interface CustomCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  error?: boolean;
}

export default function CustomCheckbox({ label, checked, onChange, id, error }: CustomCheckboxProps) {
  return (
    <div className={`custom-checkbox-container ${error ? 'has-error' : ''}`} onClick={() => onChange(!checked)}>
      <div className={`checkbox-box ${checked ? 'checked' : ''}`}>
        {checked && (
          <span className="material-symbols-outlined check-icon">check</span>
        )}
      </div>
      <label className="checkbox-label" htmlFor={id}>
        {label}
      </label>

      <style jsx>{`
        .custom-checkbox-container {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          cursor: pointer;
          user-select: none;
          padding: 0.5rem 0;
          transition: opacity 0.2s;
        }

        .custom-checkbox-container:hover {
          opacity: 0.8;
        }

        .checkbox-box {
          width: 22px;
          height: 22px;
          border: 2px solid var(--outline);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .checkbox-box.checked {
          background-color: var(--primary);
          border-color: var(--primary);
        }

        .check-icon {
          font-size: 16px;
          color: white;
          font-weight: 800;
          animation: checkPop 0.2s ease-out;
        }

        .checkbox-label {
          font-size: 0.9375rem;
          line-height: 1.5;
          color: var(--on-background-muted);
          cursor: pointer;
        }

        .has-error .checkbox-box {
          border-color: #EF4444;
        }

        @keyframes checkPop {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
