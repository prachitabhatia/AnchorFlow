import React, { useState } from 'react';

/**
 * LiveControlBar Component
 * Control toolbar with 5 buttons: Go Live, Advance, Pause, Resume, End.
 * Each button maintains ITS OWN independent pending state for double-click protection.
 */
export default function LiveControlBar({
  snapshot,
  onGoLive,
  onAdvance,
  onPause,
  onResume,
  onEnd,
}) {
  // Independent pending states for each of the 5 buttons
  const [goLivePending, setGoLivePending] = useState(false);
  const [advancePending, setAdvancePending] = useState(false);
  const [pausePending, setPausePending] = useState(false);
  const [resumePending, setResumePending] = useState(false);
  const [endPending, setEndPending] = useState(false);

  const runState = snapshot?.runState;

  // Button enablement rules:
  // Go Live: enabled if event has not started yet or has ended (runState is not "live" and not "paused")
  const canGoLive = (!snapshot || runState === 'ended' || (runState !== 'live' && runState !== 'paused')) && !goLivePending;

  // Advance: enabled ONLY when runState === "live" (NOT "paused")
  const canAdvance = runState === 'live' && !advancePending;

  // Pause: enabled ONLY when runState === "live"
  const canPause = runState === 'live' && !pausePending;

  // Resume: enabled ONLY when runState === "paused"
  const canResume = runState === 'paused' && !resumePending;

  // End: enabled when runState is "live" or "paused"
  const canEnd = (runState === 'live' || runState === 'paused') && !endPending;

  // Show "Resume to advance" hint specifically when paused
  const showPausedHint = runState === 'paused';

  const handleGoLive = async () => {
    if (!canGoLive) return;
    setGoLivePending(true);
    try {
      await onGoLive();
    } finally {
      setGoLivePending(false);
    }
  };

  const handleAdvance = async () => {
    if (!canAdvance) return;
    setAdvancePending(true);
    try {
      await onAdvance();
    } finally {
      setAdvancePending(false);
    }
  };

  const handlePause = async () => {
    if (!canPause) return;
    setPausePending(true);
    try {
      await onPause();
    } finally {
      setPausePending(false);
    }
  };

  const handleResume = async () => {
    if (!canResume) return;
    setResumePending(true);
    try {
      await onResume();
    } finally {
      setResumePending(false);
    }
  };

  const handleEnd = async () => {
    if (!canEnd) return;
    setEndPending(true);
    try {
      await onEnd();
    } finally {
      setEndPending(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--organizer-surface)',
        border: '1px solid var(--organizer-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginTop: '1.25rem',
        marginBottom: '1.25rem',
      }}
    >
      <h3
        style={{
          fontSize: '0.85rem',
          fontWeight: '700',
          color: 'var(--organizer-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '1rem',
        }}
      >
        🎛️ Stage Controls
      </h3>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'flex-start',
        }}
      >
        {/* 1. Go Live Button */}
        <button
          onClick={handleGoLive}
          disabled={!canGoLive}
          className="btn"
          style={{
            backgroundColor: canGoLive ? 'var(--organizer-success)' : 'var(--organizer-surface-hover)',
            color: canGoLive ? '#ffffff' : 'var(--organizer-text-muted)',
            cursor: canGoLive ? 'pointer' : 'not-allowed',
            opacity: canGoLive ? 1 : 0.5,
            padding: '0.65rem 1.25rem',
            fontWeight: '700',
          }}
        >
          {goLivePending ? 'Starting...' : '🚀 Go Live'}
        </button>

        {/* 2. Advance Button with paused hint container */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <button
            onClick={handleAdvance}
            disabled={!canAdvance}
            className="btn"
            style={{
              backgroundColor: canAdvance ? 'var(--organizer-accent)' : 'var(--organizer-surface-hover)',
              color: canAdvance ? '#ffffff' : 'var(--organizer-text-muted)',
              cursor: canAdvance ? 'pointer' : 'not-allowed',
              opacity: canAdvance ? 1 : 0.5,
              padding: '0.65rem 1.25rem',
              fontWeight: '700',
            }}
          >
            {advancePending ? 'Advancing...' : '⏩ Advance'}
          </button>
          {showPausedHint && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--organizer-warning)',
                fontWeight: '600',
                marginTop: '0.35rem',
              }}
            >
              Resume to advance
            </span>
          )}
        </div>

        {/* 3. Pause Button */}
        <button
          onClick={handlePause}
          disabled={!canPause}
          className="btn"
          style={{
            backgroundColor: canPause ? 'var(--organizer-warning)' : 'var(--organizer-surface-hover)',
            color: canPause ? '#000000' : 'var(--organizer-text-muted)',
            cursor: canPause ? 'pointer' : 'not-allowed',
            opacity: canPause ? 1 : 0.5,
            padding: '0.65rem 1.25rem',
            fontWeight: '700',
          }}
        >
          {pausePending ? 'Pausing...' : '⏸️ Pause'}
        </button>

        {/* 4. Resume Button */}
        <button
          onClick={handleResume}
          disabled={!canResume}
          className="btn"
          style={{
            backgroundColor: canResume ? 'var(--organizer-success)' : 'var(--organizer-surface-hover)',
            color: canResume ? '#ffffff' : 'var(--organizer-text-muted)',
            cursor: canResume ? 'pointer' : 'not-allowed',
            opacity: canResume ? 1 : 0.5,
            padding: '0.65rem 1.25rem',
            fontWeight: '700',
          }}
        >
          {resumePending ? 'Resuming...' : '▶️ Resume'}
        </button>

        {/* 5. End Button */}
        <button
          onClick={handleEnd}
          disabled={!canEnd}
          className="btn"
          style={{
            backgroundColor: canEnd ? 'var(--organizer-danger)' : 'var(--organizer-surface-hover)',
            color: canEnd ? '#ffffff' : 'var(--organizer-text-muted)',
            cursor: canEnd ? 'pointer' : 'not-allowed',
            opacity: canEnd ? 1 : 0.5,
            padding: '0.65rem 1.25rem',
            fontWeight: '700',
            marginLeft: 'auto',
          }}
        >
          {endPending ? 'Ending...' : '⏹️ End Event'}
        </button>
      </div>
    </div>
  );
}
