import React from 'react';

/**
 * Shared ErrorBanner component with class name and message/children passthrough.
 */
export default function ErrorBanner({ message, children, className = '' }) {
  if (!message && !children) return null;

  return (
    <div className={`error-banner ${className}`.trim()}>
      <span className="error-banner-icon">⚠️</span>
      <div className="error-banner-content">
        {message || children}
      </div>
    </div>
  );
}
