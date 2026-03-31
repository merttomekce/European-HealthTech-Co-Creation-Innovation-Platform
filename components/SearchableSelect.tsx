'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Check, X } from 'lucide-animated';

interface Option {
  value: string;
  label: string;
  group?: string;
}

interface SearchableSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Search or select…',
  error,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  const groups = filtered.reduce<Record<string, Option[]>>((acc, opt) => {
    const g = opt.group || '';
    if (!acc[g]) acc[g] = [];
    acc[g].push(opt);
    return acc;
  }, {});

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const open = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const select = (opt: Option) => {
    onChange(opt.value);
    setIsOpen(false);
    setQuery('');
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="ss-container" ref={containerRef}>
      <label className="form-label">{label}</label>

      <div
        className={`ss-trigger ${isOpen ? 'open' : ''} ${error ? 'error' : ''}`}
        onClick={open}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
      >
        <span className={selectedOption ? 'ss-selected' : 'ss-placeholder'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="ss-actions">
          {value && (
            <button type="button" className="ss-clear" onClick={clear} aria-label="Clear selection">
              <X size={16} animate="hover" />
            </button>
          )}
          <div className="ss-arrow">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="ss-dropdown">
          <div className="ss-search-wrap">
            <div className="ss-search-icon">
              <Search size={18} />
            </div>
            <input
              ref={inputRef}
              type="text"
              className="ss-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="ss-list">
            {filtered.length === 0 ? (
              <div className="ss-empty">No results for "{query}"</div>
            ) : (
              Object.entries(groups).map(([group, opts]) => (
                <div key={group}>
                  {group && <div className="ss-group-label">{group}</div>}
                  {opts.map((opt) => (
                    <div
                      key={opt.value}
                      className={`ss-option ${value === opt.value ? 'active' : ''}`}
                      onClick={() => select(opt)}
                    >
                      {opt.label}
                      {value === opt.value && (
                        <div className="ss-check">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && <span className="field-error" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}

      <style jsx>{`
        .ss-container {
          position: relative;
          width: 100%;
          margin-bottom: 1.5rem;
        }
        .ss-trigger {
          width: 100%;
          padding: 1.125rem 1.25rem;
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
          font-size: 0.9375rem;
          user-select: none;
        }
        .ss-trigger:hover,
        .ss-trigger.open {
          border-color: rgba(255,255,255,0.3);
        }
        .ss-trigger.open {
          box-shadow: 0 0 0 1px rgba(255,255,255,0.08);
        }
        .ss-trigger.error {
          border-color: rgba(239,68,68,0.5);
        }
        .ss-selected {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ss-placeholder {
          flex: 1;
          color: var(--on-background-muted);
          opacity: 0.6;
        }
        .ss-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .ss-clear {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          color: var(--on-background-muted);
          transition: color 0.15s;
        }
        .ss-clear:hover { color: var(--on-background); }
        .ss-arrow {
          color: var(--on-background-muted);
          display: flex;
          align-items: center;
        }
        .ss-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: var(--surface-raised);
          border: 1px solid var(--outline);
          border-radius: 12px;
          z-index: 1000;
          box-shadow: 0 16px 40px -8px rgba(0,0,0,0.5);
          overflow: hidden;
          animation: ssSlide 0.15s ease-out;
        }
        @keyframes ssSlide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ss-search-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--outline);
        }
        .ss-search-icon {
          color: var(--on-background-muted);
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .ss-search {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--on-background);
          font-family: inherit;
          font-size: 0.9375rem;
        }
        .ss-search::placeholder { color: var(--on-background-muted); opacity: 0.6; }
        .ss-list {
          max-height: 240px;
          overflow-y: auto;
        }
        .ss-list::-webkit-scrollbar { width: 4px; }
        .ss-list::-webkit-scrollbar-track { background: transparent; }
        .ss-list::-webkit-scrollbar-thumb { background: var(--outline); border-radius: 100px; }
        .ss-group-label {
          padding: 0.5rem 1.25rem 0.25rem;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--on-background-muted);
          opacity: 0.6;
        }
        .ss-option {
          padding: 0.875rem 1.25rem;
          cursor: pointer;
          font-size: 0.9375rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.15s;
          color: var(--on-background);
        }
        .ss-option:hover {
          background: rgba(255,255,255,0.04);
        }
        .ss-option.active {
          color: var(--blue-folder-top);
          background: rgba(63,171,252,0.06);
        }
        .ss-check {
          display: flex;
          align-items: center;
          color: var(--blue-folder-top);
        }
        .ss-empty {
          padding: 1.5rem 1.25rem;
          color: var(--on-background-muted);
          font-size: 0.875rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
