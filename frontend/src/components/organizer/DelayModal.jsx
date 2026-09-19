import React, { useState, useEffect } from 'react';
import { listAgendaItems } from '../../api/agenda';
import { reportDelay } from '../../api/delay';

export default function DelayModal({
  isOpen,
  onClose,
  eventId,
  currentAgendaItemId,
  onSuccess,
}) {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [loadingItems, setLoadingItems] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [is409Conflict, setIs409Conflict] = useState(false);

  // Load agenda items on open
  useEffect(() => {
    if (!isOpen || !eventId) return;

    let isMounted = true;
    setLoadingItems(true);
    setError(null);
    setIs409Conflict(false);

    listAgendaItems(eventId)
      .then((data) => {
        if (!isMounted) return;
        const fetchedItems = Array.isArray(data) ? data : [];
        setItems(fetchedItems);
        // Default to currentAgendaItemId if present, otherwise first item
        if (currentAgendaItemId && fetchedItems.some((item) => item.id === currentAgendaItemId)) {
          setSelectedItemId(currentAgendaItemId);
        } else if (fetchedItems.length > 0) {
          setSelectedItemId(fetchedItems[0].id);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load agenda items');
      })
      .finally(() => {
        if (isMounted) setLoadingItems(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, eventId, currentAgendaItemId]);

  if (!isOpen) return null;

  const minutesNum = Number(delayMinutes);
  const isMinutesValid = !isNaN(minutesNum) && minutesNum >= 1 && minutesNum <= 240;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedItemId || !isMinutesValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setIs409Conflict(false);

    try {
      const response = await reportDelay({
        agendaItemId: selectedItemId,
        delayMinutes: minutesNum,
      });
      // Pass full response along with entered minutes up to parent
      onSuccess({ ...response, enteredMinutes: minutesNum });
      onClose();
    } catch (err) {
      if (err.status === 409 || err.code === 'CONFLICT') {
        setIs409Conflict(true);
        setError('The live event changed while replanning — try again');
      } else {
        setError(err.message || 'Failed to report delay. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        className="organizer-card"
        style={{
          maxWidth: '480px',
          width: '100%',
          position: 'relative',
          border: '1px solid var(--organizer-border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Full-Modal Processing State */}
        {isSubmitting ? (
          <div
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div
              className="loading-spinner-icon"
              style={{ width: '40px', height: '40px', borderWidth: '3px' }}
            />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--organizer-text)', marginBottom: '0.35rem' }}>
                Replanning schedule...
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--organizer-text-secondary)', margin: 0 }}>
                AI is calculating delay absorbing strategies & updating the timeline.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--organizer-text)', margin: 0 }}>
                ⏱️ Report a Delay
              </h3>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--organizer-text-muted)',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                ✕
              </button>
            </div>

            {/* Error / 409 Banner */}
            {error && (
              <div
                className="error-banner"
                style={{
                  marginBottom: '1rem',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>⚠️ {error}</span>
                </div>
                {is409Conflict && (
                  <button
                    onClick={handleSubmit}
                    className="btn btn-primary"
                    style={{
                      fontSize: '0.8rem',
                      padding: '0.35rem 0.75rem',
                      backgroundColor: 'var(--organizer-warning)',
                      color: '#000',
                      marginTop: '0.25rem',
                    }}
                  >
                    🔄 Retry Submission
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Target Agenda Item Select */}
              <div>
                <label
                  htmlFor="agenda-item-select"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: 'var(--organizer-text-secondary)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Delayed Agenda Item
                </label>
                {loadingItems ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--organizer-text-muted)' }}>
                    Loading agenda items...
                  </div>
                ) : (
                  <select
                    id="agenda-item-select"
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--organizer-bg)',
                      border: '1px solid var(--organizer-border)',
                      color: 'var(--organizer-text)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title} {item.id === currentAgendaItemId ? ' (Current Active)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Delay Minutes Input */}
              <div>
                <label
                  htmlFor="delay-minutes-input"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: 'var(--organizer-text-secondary)',
                    marginBottom: '0.35rem',
                  }}
                >
                  How many minutes?
                </label>
                <input
                  id="delay-minutes-input"
                  type="number"
                  min="1"
                  max="240"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--organizer-bg)',
                    border: '1px solid var(--organizer-border)',
                    color: 'var(--organizer-text)',
                    fontSize: '0.9rem',
                  }}
                />
                {!isMinutesValid && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--organizer-danger)', marginTop: '0.25rem', display: 'block' }}>
                    Please enter between 1 and 240 minutes.
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedItemId || !isMinutesValid || isSubmitting}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: 'var(--organizer-warning)',
                    color: '#000000',
                    fontWeight: '700',
                  }}
                >
                  ⏱️ Report Delay
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
