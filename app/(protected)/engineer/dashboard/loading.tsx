import React from 'react';
import './dashboard.css';

export default function Loading() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-hero dashboard-hero-engineer">
        <div>
          <div className="skeleton-line skeleton-kicker" />
          <div className="skeleton-block skeleton-hero-title" />
          <div className="skeleton-block skeleton-hero-copy" />
        </div>
        <div className="dashboard-hero-panel">
          <div className="skeleton-line" />
          <div className="skeleton-number" />
          <div className="skeleton-block skeleton-panel-copy" />
        </div>
      </div>
      <div className="dashboard-kpi-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="dashboard-kpi-card">
            <div className="skeleton-line" />
            <div className="skeleton-number" />
            <div className="skeleton-block skeleton-card-copy" />
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-feed-shell">
          <div className="skeleton-line" />
          <div className="dashboard-feed-list">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="dashboard-feed-row dashboard-feed-row-skeleton">
                <div className="feed-date-pill skeleton-pill" />
                <div className="feed-copy">
                  <div className="skeleton-line" />
                  <div className="skeleton-block skeleton-feed-copy" />
                  <div className="skeleton-block skeleton-feed-copy short" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="aside-card">
          <div className="skeleton-line" />
          <div className="action-list">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="action-row skeleton-action-row" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
