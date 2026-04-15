'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomSelect({ label, options, value, onChange, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="custom-select-container" ref={containerRef}>
      <label className="form-label">{label}</label>
      <div 
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <span className={selectedOption ? 'selected-text' : 'placeholder-text'}>
          {selectedOption ? selectedOption.label : placeholder || 'Select an option'}
        </span>
        <div className="arrow">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isOpen && (
        <div className="custom-select-options">
          {options.map((option) => (
            <div
              key={option.value}
              className={`custom-option ${value === option.value ? 'active' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
              {value === option.value && (
                <div className="check">
                  <Check size={18} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .custom-select-container {
          position: relative;
          width: 100%;
          margin-bottom: 2rem;
        }

        .custom-select-trigger {
          width: 100%;
          padding: 1.25rem;
          background: var(--surface-raised);
          border: 1px solid var(--outline);
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--on-background);
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }

        .custom-select-trigger:hover,
        .custom-select-trigger.open {
          border-color: var(--blue-primary);
          box-shadow: 0 0 0 1px var(--blue-primary);
        }

        .placeholder-text {
          color: var(--on-background-muted);
          opacity: 0.6;
        }

        .arrow {
          color: var(--on-background-muted);
          display: flex;
          align-items: center;
        }

        .custom-select-options {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: var(--surface);
          border: 1px solid var(--outline);
          border-radius: 12px;
          z-index: 1000;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
          animation: slideUp 0.2s ease-out;
        }

        .custom-option {
          padding: 1rem 1.25rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.2s;
          font-size: 0.9375rem;
          color: var(--on-background);
        }

        .custom-option:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .custom-option.active {
          background: rgba(30, 96, 242, 0.1);
          color: var(--blue-primary);
        }

        .check {
          display: flex;
          align-items: center;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
