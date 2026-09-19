import React from 'react';

/**
 * Anchor Next Up Banner
 * Renders next segment info or "Final segment" when next is null.
 */
export default function NextUpBanner({ next }) {
  if (!next) {
    return (
      <div className="anchor-next-up">
        <span className="anchor-next-up-label">NEXT UP</span>
        <span className="anchor-next-up-title">Final segment</span>
      </div>
    );
  }

  return (
    <div className="anchor-next-up">
      <span className="anchor-next-up-label">UP NEXT</span>
      <div className="anchor-next-up-details">
        <span className="anchor-next-up-title">{next.title || 'Upcoming Session'}</span>
        {next.speakerName && (
          <span className="anchor-next-up-speaker">👤 {next.speakerName}</span>
        )}
        {next.type && (
          <span className="anchor-next-up-type">({next.type})</span>
        )}
      </div>
    </div>
  );
}
