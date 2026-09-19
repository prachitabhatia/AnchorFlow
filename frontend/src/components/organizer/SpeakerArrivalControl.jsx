import React, { useState, useEffect } from 'react';
import { listSpeakers } from '../../api/speakers';
import { speakerArrived } from '../../api/arrival';

export default function SpeakerArrivalControl({ eventId, runState, onLiveStateUpdate }) {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingSpeakerId, setPendingSpeakerId] = useState(null);
  const [recentScripts, setRecentScripts] = useState({}); // speakerId -> script content

  useEffect(() => {
    if (!eventId) return;
    let isMounted = true;
    setLoading(true);

    listSpeakers(eventId)
      .then((data) => {
        if (isMounted) setSpeakers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load speakers');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const handleMarkArrived = async (speakerId) => {
    if (pendingSpeakerId || runState !== 'live') return;

    setPendingSpeakerId(speakerId);
    setError(null);

    try {
      const response = await speakerArrived(speakerId);
      const { speaker: updatedSpeaker, script, liveState } = response;

      // Update local speaker status in list
      setSpeakers((prev) =>
        prev.map((s) =>
          s.id === speakerId
            ? { ...s, arrivalStatus: updatedSpeaker?.arrivalStatus || 'arrived' }
            : s
        )
      );

      // Save intro script preview if provided
      if (script?.content) {
        setRecentScripts((prev) => ({
          ...prev,
          [speakerId]: {
            content: script.content,
            source: script.source || 'ai',
          },
        }));
      }

      // Pass updated liveState to LiveControlPage instantly
      if (liveState && onLiveStateUpdate) {
        onLiveStateUpdate(liveState);
      }
    } catch (err) {
      setError(err.message || 'Failed to mark speaker as arrived');
    } finally {
      setPendingSpeakerId(null);
    }
  };

  const getStatusBadgeConfig = (status) => {
    switch (status) {
      case 'arrived':
        return { label: 'ARRIVED', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: 'rgba(16, 185, 129, 0.4)' };
      case 'on_stage':
        return { label: 'ON STAGE', bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.4)' };
      case 'done':
        return { label: 'DONE', bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.4)' };
      default:
        return { label: 'NOT ARRIVED', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.4)' };
    }
  };

  return (
    <div
      className="organizer-card"
      style={{
        marginTop: '1.25rem',
        border: '1px solid var(--organizer-border)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--organizer-text)', margin: 0 }}>
            🎤 Speaker Arrival Status
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--organizer-text-secondary)', margin: '0.2rem 0 0 0' }}>
            Mark speakers as arrived to automatically generate AI introductions and clear schedule delays.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '1rem' }}>
          <span>⚠️ {error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--organizer-text-muted)' }}>
          Loading event speakers...
        </div>
      ) : speakers.length === 0 ? (
        <div
          style={{
            padding: '1.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--organizer-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--organizer-border)',
            color: 'var(--organizer-text-muted)',
            fontSize: '0.9rem',
          }}
        >
          No speakers assigned to this event yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {speakers.map((speaker) => {
            const isArrived = speaker.arrivalStatus === 'arrived' || speaker.arrivalStatus === 'on_stage' || speaker.arrivalStatus === 'done';
            const isPending = pendingSpeakerId === speaker.id;
            const canMarkArrived = runState === 'live' && !isArrived && !pendingSpeakerId;
            const badgeCfg = getStatusBadgeConfig(speaker.arrivalStatus);
            const scriptData = recentScripts[speaker.id];

            return (
              <div
                key={speaker.id}
                style={{
                  backgroundColor: 'var(--organizer-bg)',
                  border: '1px solid var(--organizer-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--organizer-text)' }}>
                      {speaker.name}
                    </strong>
                    {(speaker.role || speaker.organization) && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--organizer-text-muted)', marginLeft: '0.5rem' }}>
                        • {speaker.role} {speaker.organization ? `(${speaker.organization})` : ''}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Arrival Status Badge (Read-only) */}
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        backgroundColor: badgeCfg.bg,
                        color: badgeCfg.color,
                        border: `1px solid ${badgeCfg.border}`,
                      }}
                    >
                      {badgeCfg.label}
                    </span>

                    {/* Mark Arrived Action Button */}
                    <button
                      onClick={() => handleMarkArrived(speaker.id)}
                      disabled={!canMarkArrived}
                      className="btn"
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        backgroundColor: canMarkArrived ? 'var(--organizer-success)' : 'var(--organizer-surface-hover)',
                        color: canMarkArrived ? '#ffffff' : 'var(--organizer-text-muted)',
                        cursor: canMarkArrived ? 'pointer' : 'not-allowed',
                        opacity: canMarkArrived ? 1 : 0.5,
                      }}
                    >
                      {isPending ? 'Marking...' : isArrived ? '✓ Arrived' : '🎤 Mark Arrived'}
                    </button>
                  </div>
                </div>

                {/* Introduction Script Preview (Renders when marked arrived) */}
                {scriptData && (
                  <div
                    style={{
                      marginTop: '0.25rem',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'var(--organizer-surface)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontSize: '0.825rem',
                      color: 'var(--organizer-text-secondary)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '700', color: '#10b981', fontSize: '0.75rem' }}>
                        ✨ Introduction Script Ready
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--organizer-text-muted)' }}>
                        Source: {scriptData.source === 'ai' ? 'AI Generated' : 'Fallback'}
                      </span>
                    </div>
                    <div style={{ lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                      {scriptData.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
