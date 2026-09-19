import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../shared/Button';

export default function EventCard({ event, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setDeleting(true);
    try {
      await onDelete(event.id);
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  };

  const formattedDate = event.date
    ? new Date(event.date).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'No Date Set';

  return (
    <div style={{
      backgroundColor: 'var(--organizer-surface)',
      border: '1px solid var(--organizer-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem 1.5rem',
      marginBottom: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: 'var(--shadow-sm)',
      transition: 'border-color var(--transition-fast)'
    }}>
      <div style={{ textAlign: 'left', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            {event.name}
          </h3>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--organizer-bg)',
            border: '1px solid var(--organizer-border)',
            color: 'var(--organizer-accent)',
            textTransform: 'capitalize',
            fontWeight: 600
          }}>
            {event.tone}
          </span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--organizer-bg)',
            border: '1px solid var(--organizer-border)',
            color: 'var(--organizer-text-muted)',
            textTransform: 'capitalize'
          }}>
            {event.type}
          </span>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--organizer-text-secondary)', display: 'flex', gap: '1.5rem' }}>
          <span>📅 {formattedDate}</span>
          <span>ID: <code style={{ color: 'var(--organizer-text-muted)' }}>{event.id}</code></span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to={`/organizer/events/${event.id}`}>
          <Button variant="secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
            Open Control Room →
          </Button>
        </Link>

        {confirming ? (
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                backgroundColor: 'var(--organizer-danger)',
                color: '#fff',
                padding: '0.4rem 0.75rem',
                fontSize: '0.825rem'
              }}
            >
              {deleting ? 'Deleting...' : 'Confirm Delete?'}
            </Button>
            <Button
              onClick={() => setConfirming(false)}
              disabled={deleting}
              variant="secondary"
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.825rem' }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleDelete}
            variant="secondary"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: 'var(--organizer-danger)',
              padding: '0.4rem 0.75rem',
              fontSize: '0.85rem'
            }}
          >
            🗑️ Delete
          </Button>
        )}
      </div>
    </div>
  );
}
