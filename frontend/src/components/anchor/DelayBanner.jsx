import React from 'react';

/**
 * Anchor Delay Banner
 * Prominently rendered when scheduleStatus === "delayed".
 */
export default function DelayBanner({ delayOffsetMinutes = 0 }) {
  return (
    <div className="anchor-delay-banner">
      <span className="anchor-delay-icon">⚠️</span>
      <span className="anchor-delay-text">
        RUNNING LATE {delayOffsetMinutes > 0 ? `(+${delayOffsetMinutes} min delay)` : ''}
      </span>
    </div>
  );
}
