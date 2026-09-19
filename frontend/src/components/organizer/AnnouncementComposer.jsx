import React, { useState, useEffect } from 'react';
import { createAnnouncement, listAnnouncements } from '../../api/announcements';

export default function AnnouncementComposer({ eventId, runState, onLiveStateUpdate }) {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    let isMounted = true;
    setLoadingHistory(true);

    listAnnouncements(eventId)
      .then((data) => {
        if (isMounted) setHistory(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load announcement history');
      })
      .finally(() => {
        if (isMounted) setLoadingHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const messageLength = message.trim().length;
  const isValidLength = messageLength >= 3 && messageLength <= 500;
  const canSend = runState === 'live' && isValidLength && !isSubmitting;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!canSend) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createAnnouncement(eventId, message.trim());
      const { announcement, liveState } = response;

      // Prepend new announcement to local history
      if (announcement) {
        setHistory((prev) => [announcement, ...prev]);
      }

      // Clear textarea
      setMessage('');

      // Pass updated liveState to LiveControlPage instantly
      if (liveState && onLiveStateUpdate) {
        onLiveStateUpdate(liveState);
      }
    } catch (err) {
      setError(err.message || 'Failed to broadcast announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
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
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--organizer-text)', margin: 0 }}>
          📢 Broadcast Announcement
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--organizer-text-secondary)', margin: '0.2rem 0 0 0' }}>
          Compose urgent stage announcements. Overrides current stage prompt on the teleprompter immediately.
        </p>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '1rem' }}>
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type live announcement message for the stage anchor (e.g. 'Lunch break delayed by 15 mins')..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--organizer-bg)',
              border: '1px solid var(--organizer-border)',
              color: 'var(--organizer-text)',
              fontSize: '0.9rem',
              resize: 'vertical',
              lineHeight: '1.5',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                color: messageLength > 500 ? 'var(--organizer-danger)' : 'var(--organizer-text-muted)',
              }}
            >
              {messageLength} / 500 characters (min 3)
            </span>
            {runState !== 'live' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--organizer-warning)', fontWeight: '600' }}>
                Resume the event to broadcast
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={!canSend}
            className="btn btn-primary"
            style={{
              backgroundColor: canSend ? 'var(--organizer-accent)' : 'var(--organizer-surface-hover)',
              color: canSend ? '#ffffff' : 'var(--organizer-text-muted)',
              cursor: canSend ? 'pointer' : 'not-allowed',
              opacity: canSend ? 1 : 0.5,
              fontWeight: '700',
            }}
          >
            {isSubmitting ? 'Sending...' : '📢 Send Announcement'}
          </button>
        </div>
      </form>

      {/* History List */}
      <div>
        <h4
          style={{
            fontSize: '0.8rem',
            fontWeight: '700',
            color: 'var(--organizer-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
          }}
        >
          📋 Announcement History
        </h4>

        {loadingHistory ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--organizer-text-muted)', padding: '0.5rem 0' }}>
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div
            style={{
              padding: '1rem',
              textAlign: 'center',
              backgroundColor: 'var(--organizer-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--organizer-border)',
              color: 'var(--organizer-text-muted)',
              fontSize: '0.85rem',
            }}
          >
            No announcements broadcast yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'var(--organizer-bg)',
                  border: '1px solid var(--organizer-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}
              >
                <div style={{ color: 'var(--organizer-text)', lineHeight: '1.4' }}>
                  {item.message}
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--organizer-text-muted)',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-family-mono)',
                  }}
                >
                  {formatDate(item.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
