import { useState, useEffect, useCallback } from 'react';
import { getAggregate, regenerateLine as apiRegenerateLine } from '../api/crowdBrain';

// 7-second polling interval (matching Stage 8 live event interval, never faster)
const CROWD_BRAIN_POLL_INTERVAL = 7000;

export function useCrowdBrain(eventId, agendaItemId) {
  const [aggregate, setAggregate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateResult, setRegenerateResult] = useState(null);

  useEffect(() => {
    // If no agendaItemId (e.g. before go-live or between segments), reset state and do NOT poll
    if (!eventId || !agendaItemId) {
      setAggregate(null);
      setLoading(false);
      setError(null);
      setRegenerateResult(null);
      return;
    }

    let isMounted = true;

    async function fetchAggregate(isInitial = false) {
      if (isInitial) setLoading(true);
      try {
        const data = await getAggregate(eventId, agendaItemId);
        if (isMounted) {
          setAggregate(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch Crowd Brain aggregate');
        }
      } finally {
        if (isMounted && isInitial) {
          setLoading(false);
        }
      }
    }

    // Immediately fetch when agendaItemId or eventId changes
    fetchAggregate(true);

    // Setup 7-second polling timer
    const timerId = setInterval(() => {
      fetchAggregate(false);
    }, CROWD_BRAIN_POLL_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(timerId);
    };
  }, [eventId, agendaItemId]);

  const triggerRegenerateLine = useCallback(async () => {
    if (!eventId || !agendaItemId || isRegenerating) return;

    setIsRegenerating(true);
    setRegenerateResult(null);

    try {
      const res = await apiRegenerateLine(eventId, agendaItemId);
      if (res?.suggestedLine) {
        setAggregate((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            crowdBrain: prev.crowdBrain
              ? { ...prev.crowdBrain, suggestedLine: res.suggestedLine }
              : {
                  moodLabel: 'neutral',
                  moodEmoji: '💬',
                  insightText: '',
                  recommendationText: '',
                  suggestedLine: res.suggestedLine,
                  totalResponsesAtCompute: prev.totalResponses || 0,
                  isStale: false,
                },
          };
        });
      }

      setRegenerateResult({
        regenerated: Boolean(res?.regenerated),
        timestamp: Date.now(),
      });
    } catch (err) {
      setRegenerateResult({
        regenerated: false,
        error: err.message || 'Failed to regenerate line',
        timestamp: Date.now(),
      });
    } finally {
      setIsRegenerating(false);
    }
  }, [eventId, agendaItemId, isRegenerating]);

  return {
    aggregate,
    loading,
    error,
    isRegenerating,
    regenerateResult,
    triggerRegenerateLine,
  };
}
