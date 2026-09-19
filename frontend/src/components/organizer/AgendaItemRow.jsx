import { useState } from 'react';
import Button from '../shared/Button';

export default function AgendaItemRow({
  item,
  index,
  totalItems,
  speakers = [],
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  reordering = false
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setDeleting(true);
    try {
      await onDelete(item.id);
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  };

  // Find assigned speaker by speakerId from speakers array
  const assignedSpeaker = item.speakerId
    ? speakers.find((s) => s.id === item.speakerId)
    : null;

  // Format effectiveStart and effectiveEnd directly from API returned values
  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const startTime = formatTime(item.effectiveStart);
  const endTime = formatTime(item.effectiveEnd);

  return (
    <div style={{
      backgroundColor: item.isBuffer ? 'rgba(245, 158, 11, 0.08)' : 'var(--organizer-surface)',
      border: `1px solid ${item.isBuffer ? 'rgba(245, 158, 11, 0.3)' : 'var(--organizer-border)'}`,
      borderRadius: 'var(--radius-md)',
      padding: '1rem 1.25rem',
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      boxShadow: 'var(--shadow-sm)',
      textAlign: 'left'
    }}>
      {/* Reorder Buttons (Up / Down) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <button
          onClick={() => onMoveUp(index)}
          disabled={index === 0 || reordering}
          title="Move Up"
          style={{
            background: 'none',
            border: '1px solid var(--organizer-border)',
            color: index === 0 ? 'var(--organizer-text-muted)' : 'var(--organizer-text)',
            borderRadius: 'var(--radius-sm)',
            cursor: index === 0 || reordering ? 'not-allowed' : 'pointer',
            padding: '0.15rem 0.4rem',
            fontSize: '0.75rem',
            lineHeight: 1,
            opacity: index === 0 || reordering ? 0.4 : 1
          }}
        >
          ▲
        </button>
        <button
          onClick={() => onMoveDown(index)}
          disabled={index === totalItems - 1 || reordering}
          title="Move Down"
          style={{
            background: 'none',
            border: '1px solid var(--organizer-border)',
            color: index === totalItems - 1 ? 'var(--organizer-text-muted)' : 'var(--organizer-text)',
            borderRadius: 'var(--radius-sm)',
            cursor: index === totalItems - 1 || reordering ? 'not-allowed' : 'pointer',
            padding: '0.15rem 0.4rem',
            fontSize: '0.75rem',
            lineHeight: 1,
            opacity: index === totalItems - 1 || reordering ? 0.4 : 1
          }}
        >
          ▼
        </button>
      </div>

      {/* Main Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--organizer-text-muted)' }}>
            #{index + 1}
          </span>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            {item.title}
          </h4>
          {item.isBuffer && (
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.1rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              color: 'var(--organizer-warning)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              textTransform: 'uppercase'
            }}>
              Buffer
            </span>
          )}
        </div>

        <div style={{ fontSize: '0.825rem', color: 'var(--organizer-text-secondary)', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <span>🏷️ {item.type}</span>
          <span>⏱️ {item.durationMinutes} min</span>
          {assignedSpeaker ? (
            <span>👤 <strong style={{ color: 'var(--organizer-accent)' }}>{assignedSpeaker.name}</strong> ({assignedSpeaker.organization})</span>
          ) : (
            <span style={{ fontStyle: 'italic', color: 'var(--organizer-text-muted)' }}>👤 No Speaker</span>
          )}
        </div>
      </div>

      {/* Effective Start / End Times Display (Direct from Backend API) */}
      <div style={{
        textAlign: 'right',
        minWidth: '130px',
        backgroundColor: 'var(--organizer-bg)',
        padding: '0.4rem 0.75rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--organizer-border)'
      }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--organizer-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Effective Time</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--organizer-success)' }}>
          {startTime} - {endTime}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <Button
          onClick={() => onEdit(item)}
          variant="secondary"
          disabled={deleting || reordering}
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
        >
          ✏️ Edit
        </Button>

        {confirming ? (
          <Button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              backgroundColor: 'var(--organizer-danger)',
              color: '#fff',
              padding: '0.35rem 0.65rem',
              fontSize: '0.8rem'
            }}
          >
            {deleting ? 'Deleting...' : 'Confirm?'}
          </Button>
        ) : (
          <Button
            onClick={handleDelete}
            variant="secondary"
            disabled={reordering}
            style={{
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: 'var(--organizer-danger)',
              padding: '0.35rem 0.65rem',
              fontSize: '0.8rem'
            }}
          >
            🗑️
          </Button>
        )}
      </div>
    </div>
  );
}
