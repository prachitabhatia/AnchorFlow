import React from 'react';

/**
 * Anchor Teleprompter Script Card
 * Large high-visibility display for teleprompter text.
 */
export default function ScriptCard({ script }) {
  const content = script?.content ? script.content : null;

  return (
    <div className="anchor-teleprompter-card">
      {script?.type && (
        <div className="anchor-script-type-tag">
          {script.type.replace('_', ' ')}
        </div>
      )}
      <div className="anchor-teleprompter-text">
        {content || 'Getting ready for stage cue...'}
      </div>
    </div>
  );
}
