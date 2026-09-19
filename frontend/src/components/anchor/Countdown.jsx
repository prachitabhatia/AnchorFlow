import React from 'react';
import { useCountdown } from '../../hooks/useCountdown';

/**
 * Anchor Per-Second Countdown Component
 * Displays server-corrected, drift-free per-second countdown.
 */
export default function Countdown({ snapshot, serverOffset = 0 }) {
  const endsAtIso = snapshot?.current?.endsAt;
  const isPaused = snapshot?.runState === 'paused';

  const { formatted, isEnded } = useCountdown({
    endsAtIso,
    serverOffset,
    isPaused,
  });

  if (!endsAtIso) {
    return (
      <div className="anchor-timer" style={{ opacity: 0.6 }}>
        ⏱️ --:--
      </div>
    );
  }

  return (
    <div className="anchor-timer" style={{
      backgroundColor: 'var(--anchor-surface-elevated)',
      border: `1px solid ${isEnded ? 'rgba(239, 68, 68, 0.4)' : 'var(--anchor-border)'}`,
      padding: '0.4rem 0.85rem',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-family-mono)',
      fontSize: '1.25rem',
      fontWeight: 700,
      color: isEnded ? 'var(--anchor-status-warning)' : 'var(--anchor-text-accent)',
      transition: 'color var(--transition-fast)'
    }}>
      ⏱️ {isEnded ? "Time's Up (00:00)" : formatted}
    </div>
  );
}
