import React from 'react';

/**
 * CurrentNextPanel Component
 * Displays the current active item with its script preview,
 * as well as the up-next item with speaker details.
 */
export default function CurrentNextPanel({ current, next, runState }) {
  const currentItem = current?.item;
  const currentScript = current?.script;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem',
        marginTop: '1.25rem',
        marginBottom: '1.25rem',
      }}
    >
      {/* Current Agenda Item Section */}
      <div
        style={{
          backgroundColor: 'var(--organizer-surface)',
          border: '1px solid var(--organizer-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: 'var(--organizer-accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Current Segment
          </span>
          {currentItem?.type && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: '600',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--organizer-surface-hover)',
                color: 'var(--organizer-text-secondary)',
                border: '1px solid var(--organizer-border)',
              }}
            >
              {currentItem.type}
            </span>
          )}
        </div>

        {currentItem ? (
          <>
            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: '700',
                color: 'var(--organizer-text)',
                margin: 0,
              }}
            >
              {currentItem.title}
            </h3>

            {/* Script Preview */}
            <div
              style={{
                backgroundColor: 'var(--organizer-bg)',
                border: '1px solid var(--organizer-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                fontSize: '0.875rem',
                color: 'var(--organizer-text-secondary)',
                maxHeight: '140px',
                overflowY: 'auto',
                lineHeight: '1.5',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  color: 'var(--organizer-text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '0.35rem',
                }}
              >
                📜 Script Preview {currentScript?.type ? `(${currentScript.type})` : ''}
              </div>
              {currentScript?.content ? (
                <span>{currentScript.content}</span>
              ) : (
                <em style={{ color: 'var(--organizer-text-muted)' }}>
                  No script attached to current item.
                </em>
              )}
            </div>
          </>
        ) : (
          <div
            style={{
              padding: '1.5rem 1rem',
              textAlign: 'center',
              backgroundColor: 'var(--organizer-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--organizer-border)',
              color: 'var(--organizer-text-muted)',
              fontSize: '0.9rem',
            }}
          >
            {runState === 'ended' ? (
              <span>🏁 Event has completed. No current active item.</span>
            ) : (
              <span>⏹️ No item currently active. Click <strong>Go Live</strong> to start.</span>
            )}
          </div>
        )}
      </div>

      {/* Up Next Agenda Item Section */}
      <div
        style={{
          backgroundColor: 'var(--organizer-surface)',
          border: '1px solid var(--organizer-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#38bdf8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Up Next
          </span>
          {next?.type && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: '600',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--organizer-surface-hover)',
                color: 'var(--organizer-text-secondary)',
                border: '1px solid var(--organizer-border)',
              }}
            >
              {next.type}
            </span>
          )}
        </div>

        {next ? (
          <>
            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: '700',
                color: 'var(--organizer-text)',
                margin: 0,
              }}
            >
              {next.title}
            </h3>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 0.85rem',
                backgroundColor: 'var(--organizer-bg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--organizer-border)',
                fontSize: '0.85rem',
                color: 'var(--organizer-text-secondary)',
              }}
            >
              <span>🎤 Speaker:</span>
              <strong style={{ color: 'var(--organizer-text)' }}>
                {next.speakerName || 'No speaker assigned'}
              </strong>
            </div>
          </>
        ) : (
          <div
            style={{
              padding: '1.5rem 1rem',
              textAlign: 'center',
              backgroundColor: 'var(--organizer-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--organizer-border)',
              color: 'var(--organizer-text-muted)',
              fontSize: '0.9rem',
            }}
          >
            {currentItem ? (
              <span>🏁 Final Segment — No upcoming items remaining.</span>
            ) : (
              <span>No upcoming item available.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
