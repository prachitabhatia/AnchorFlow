import { useState, useEffect } from 'react';
import { getLiveSnapshot } from '../api/live';
import { useSocket } from './useSocket';
import { computeServerOffset } from '../utils/time';

/**
 * Hybrid Live Event Hook (Polling + Socket.IO)
 * Maintains Stage 8's 7-second polling cadence as a baseline,
 * layered with instant Socket.IO 'live:update' events.
 */
export function useLiveEvent(eventId) {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notStarted, setNotStarted] = useState(false);
  const [error, setError] = useState(null);
  const [serverOffset, setServerOffset] = useState(0);

  // Layer Socket.IO connection
  const { latestUpdate, connected } = useSocket(eventId);

  const applySnapshotData = (data) => {
    if (!data) return;
    setSnapshot(data);
    setNotStarted(false);
    setError(null);
    if (data.serverTime) {
      setServerOffset(computeServerOffset(data.serverTime));
    }
  };

  // Whenever Socket.IO delivers a new 'live:update' payload, update state immediately
  useEffect(() => {
    if (latestUpdate) {
      applySnapshotData(latestUpdate);
      setLoading(false);
    }
  }, [latestUpdate]);

  // Stage 8 Polling (7s interval) runs indefinitely alongside socket
  useEffect(() => {
    if (!eventId) return;

    let isMounted = true;

    async function pollSnapshot(isInitial = false) {
      try {
        const data = await getLiveSnapshot(eventId);
        if (isMounted) {
          applySnapshotData(data);
          if (isInitial) {
            setLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          if (err.status === 404) {
            setNotStarted(true);
            setSnapshot(null);
            setError(null);
          } else {
            // Transient polling error: retain last snapshot if available
            setError(err.message || 'Failed to poll live snapshot');
          }
          if (isInitial) {
            setLoading(false);
          }
        }
      }
    }

    // Initial polling fetch immediately
    pollSnapshot(true);

    // Setup 7-second polling interval
    const timerId = setInterval(() => {
      pollSnapshot(false);
    }, 7000);

    return () => {
      isMounted = false;
      clearInterval(timerId);
    };
  }, [eventId]);

  return {
    snapshot,
    loading,
    notStarted,
    error,
    serverOffset,
    connected,
  };
}
