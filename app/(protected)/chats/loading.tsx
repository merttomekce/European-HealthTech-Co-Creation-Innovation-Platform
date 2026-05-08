import React from 'react';

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-island">
        <div className="loading-spinner"></div>
        <span>Opening collaborations...</span>
      </div>
    </div>
  );
}
