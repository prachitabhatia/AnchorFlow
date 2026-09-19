import React from 'react';

/**
 * Shared LoadingSpinner component with class name passthrough.
 */
export default function LoadingSpinner({ label = 'Loading...', className = '' }) {
  return (
    <div className={`loading-spinner-container ${className}`.trim()}>
      <div className="loading-spinner-icon" />
      {label && <span className="loading-spinner-label">{label}</span>}
    </div>
  );
}
