import { useState } from 'react';
import Button from '../shared/Button';

export default function SpeakerCard({ speaker, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setDeleting(true);
    try {
      await onDelete(speaker.id);
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  };

  // Truncate bio preview to ~140 chars for clean card presentation
  const bioPreview = speaker.bio && speaker.bio.length > 140
    ? `${speaker.bio.slice(0, 140)}...`
    : speaker.bio;

  return (
    <div style={{
      backgroundColor: 'var(--organizer-surface)',
      border: '1px solid var(--organizer-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem 1.5rem',
      marginBottom: '1rem',
      boxShadow: 'var(--shadow-sm)',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
        <div>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            {speaker.name}
          </h4>
          <div style={{ fontSize: '0.875rem', color: 'var(--organizer-accent)', fontWeight: 600, marginTop: '0.2rem' }}>
            {speaker.role} <span style={{ color: 'var(--organizer-text-secondary)' }}>@ {speaker.organization}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            onClick={() => onEdit(speaker)}
            variant="secondary"
            disabled={deleting}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}
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
                padding: '0.35rem 0.75rem',
                fontSize: '0.825rem'
              }}
            >
              {deleting ? 'Deleting...' : 'Confirm Delete?'}
            </Button>
          ) : (
            <Button
              onClick={handleDelete}
              variant="secondary"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: 'var(--organizer-danger)',
                padding: '0.35rem 0.75rem',
                fontSize: '0.825rem'
              }}
            >
              🗑️ Delete
            </Button>
          )}
        </div>
      </div>

      <p style={{
        fontSize: '0.875rem',
        color: 'var(--organizer-text-secondary)',
        lineHeight: 1.5,
        margin: '0.5rem 0 0 0',
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        padding: '0.65rem 0.85rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(51, 65, 85, 0.4)'
      }}>
        "{bioPreview}"
      </p>

      {confirming && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: 'var(--organizer-warning)',
          fontSize: '0.8rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>⚠️ <em>Note: Any agenda item assigned to this speaker will lose its link (unassigned) rather than being deleted.</em></span>
          <button
            onClick={() => setConfirming(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--organizer-text-secondary)',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.8rem'
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
