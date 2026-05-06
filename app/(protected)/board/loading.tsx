import React from 'react';
import './board.css';

export default function Loading() {
  return (
    <div className="board-shell">
      <div className="board-hero">
        <div>
          <div className="skeleton-line skeleton-kicker" />
          <div className="skeleton-block skeleton-board-hero-title" />
          <div className="skeleton-block skeleton-board-hero-copy" />
        </div>
        <div className="board-hero-panel">
          <div className="skeleton-line" />
          <div className="skeleton-number" />
          <div className="skeleton-block skeleton-panel-copy" />
        </div>
      </div>

      <div className="board-toolbar">
        <div className="board-search skeleton-search">
          <div className="skeleton-block skeleton-search-icon" />
          <div className="skeleton-block skeleton-search-copy" />
        </div>
        <div className="skeleton-pill button-skeleton" />
      </div>

      <div className="board-chip-row">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="skeleton-pill chip-skeleton" />
        ))}
      </div>

      <div className="board-card-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="board-card board-card-skeleton">
            <div className="board-card-topline">
              <div className="board-card-badges">
                <div className="skeleton-pill chip-skeleton" />
                <div className="skeleton-pill chip-skeleton short" />
              </div>
              <div className="skeleton-line skeleton-date" />
            </div>
            <div className="skeleton-block skeleton-card-title" />
            <div className="skeleton-block skeleton-card-copy" />
            <div className="board-card-meta">
              {Array.from({ length: 3 }).map((__, metaIndex) => (
                <div key={metaIndex} className="board-meta-item">
                  <div className="skeleton-line skeleton-meta-label" />
                  <div className="skeleton-block skeleton-meta-value" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
