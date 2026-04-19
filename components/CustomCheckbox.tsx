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
    <label className={`custom-checkbox-container ${error ? 'has-error' : ''}`} htmlFor={id}>
      <input 
        type="checkbox" 
        id={id} 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
        style={{ position: 'absolute', opacity: 0, cursor: 'pointer', height: 0, width: 0 }} 
      />
      <div className={`checkbox-box ${checked ? 'checked' : ''}`}>
        {checked && (
          <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </div>
      <span className="checkbox-label">
        {label}
      </span>

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
          width: 14px;
          height: 14px;
          color: white;
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
    </label>
  );
}
