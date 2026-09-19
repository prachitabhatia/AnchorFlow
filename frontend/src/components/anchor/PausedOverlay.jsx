import React from 'react';

/**
 * Anchor Paused Overlay
 * Rendered on top of the stage layout when runState === "paused".
 */
export default function PausedOverlay() {
  return (
    <div className="anchor-paused-overlay">
      <div className="anchor-paused-box">
        <div className="anchor-paused-icon">⏸️</div>
        <h2 className="anchor-paused-title">STAGE PAUSED</h2>
        <p className="anchor-paused-subtitle">The stage flow is temporarily paused by the control room.</p>
      </div>
    </div>
  );
}
