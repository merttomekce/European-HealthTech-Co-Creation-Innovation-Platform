'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';

interface TagInputProps {
  label: string;
  value: string[]; // array of selected tags
  onChange: (tags: string[]) => void;
  presets?: string[];
  placeholder?: string;
  maxTags?: number;
  error?: string;
}

export default function TagInput({
  label,
  value,
  onChange,
  presets = [],
  placeholder = 'Type and press Enter…',
  maxTags = 10,
  error,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed) || value.length >= maxTags) return;
    onChange([...value, trimmed]);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const togglePreset = (preset: string) => {
    if (value.includes(preset)) {
      removeTag(preset);
    } else {
      addTag(preset);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="tag-input-wrap">
      <label className="form-label">{label}</label>

      {/* Preset chips */}
      {presets.length > 0 && (
        <div className="tag-presets">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`tag-preset-chip ${value.includes(preset) ? 'selected' : ''}`}
              onClick={() => togglePreset(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      {/* Tag pill display + text input */}
      <div
        className={`tag-input-field ${error ? 'error' : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span key={tag} className="tag-pill">
            {tag}
            <button
              type="button"
              className="tag-remove"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              aria-label={`Remove ${tag}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
            </button>
          </span>
        ))}
        {value.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            className="tag-text-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ''}
          />
        )}
      </div>
      {error && <span className="field-error" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}

      <style jsx>{`
        .tag-input-wrap {
          width: 100%;
          margin-bottom: 1.5rem;
        }
        .tag-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .tag-preset-chip {
          padding: 0.375rem 0.875rem;
          border-radius: 100px;
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid var(--outline);
          background: transparent;
          color: var(--on-background-muted);
          font-family: inherit;
          transition: all 0.15s ease;
        }
        .tag-preset-chip:hover {
          border-color: rgba(255,255,255,0.25);
          color: var(--on-background);
          background: rgba(255,255,255,0.05);
        }
        .tag-preset-chip.selected {
          background: var(--blue-primary);
          border-color: var(--blue-primary);
          color: #fff;
        }
        .tag-input-field {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
          min-height: 52px;
          padding: 0.625rem 0.875rem;
          background: var(--surface-raised);
          border: 1px solid var(--outline);
          border-radius: 12px;
          cursor: text;
          transition: border-color 0.2s;
        }
        .tag-input-field:focus-within {
          border-color: rgba(255,255,255,0.3);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.08);
        }
        .tag-input-field.error {
          border-color: rgba(239,68,68,0.5);
        }
        .tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.625rem;
          border-radius: 100px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          font-size: 0.8125rem;
          color: var(--on-background);
          font-weight: 500;
          white-space: nowrap;
        }
        .tag-remove {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          color: var(--on-background-muted);
          transition: color 0.15s;
        }
        .tag-remove:hover {
          color: #ef4444;
        }
        .tag-text-input {
          flex: 1;
          min-width: 120px;
          background: transparent;
          border: none;
          outline: none;
          color: var(--on-background);
          font-family: inherit;
          font-size: 0.9375rem;
        }
        .tag-text-input::placeholder {
          color: var(--on-background-muted);
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
