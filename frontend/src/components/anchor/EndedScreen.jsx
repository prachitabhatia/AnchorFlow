import React from 'react';

/**
 * Anchor Ended Screen
 * Displayed when runState === "ended".
 */
export default function EndedScreen({ eventName, closingScript }) {
  return (
    <div className="anchor-ended-screen">
      <div className="anchor-ended-box">
        <div className="anchor-ended-icon">🏁</div>
        <h1 className="anchor-ended-title">Event Concluded</h1>
        <p className="anchor-ended-event">{eventName || 'Smart Anchor Stage'}</p>

        <div className="anchor-ended-content">
          {closingScript?.content ? closingScript.content : 'Thank you for joining us!'}
        </div>
      </div>
    </div>
  );
}
