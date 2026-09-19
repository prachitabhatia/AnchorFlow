import { useState, useEffect } from 'react';
import { correctedNow } from '../utils/time';

/**
 * Custom hook for a drift-free per-second countdown.
 * Computes remaining time from scratch on each tick using serverOffset.
 * Freezes ticking while isPaused is true.
 */
export function useCountdown({ endsAtIso, serverOffset = 0, isPaused = false }) {
  const calculateRemainingMs = () => {
    if (!endsAtIso) return 0;
    const endsAtMs = new Date(endsAtIso).getTime();
    if (isNaN(endsAtMs)) return 0;
    const nowMs = correctedNow(serverOffset);
    const diff = endsAtMs - nowMs;
    return diff > 0 ? diff : 0;
  };

  const formatMs = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(mins)}:${pad(secs)}`;
  };

  const [remainingMs, setRemainingMs] = useState(calculateRemainingMs);

  useEffect(() => {
    if (!endsAtIso || isPaused) {
      // Recompute once for current frozen state, then do not set interval
      setRemainingMs(calculateRemainingMs());
      return;
    }

    // Immediate calculation on mount / prop change
    setRemainingMs(calculateRemainingMs());

    const timerId = setInterval(() => {
      setRemainingMs(calculateRemainingMs());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [endsAtIso, serverOffset, isPaused]);

  return {
    remainingMs,
    formatted: formatMs(remainingMs),
    isEnded: remainingMs === 0,
  };
}
