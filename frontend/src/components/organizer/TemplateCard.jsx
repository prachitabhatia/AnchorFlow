import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../shared/Button';

/**
 * TemplateCard Component
 * Displays a reusable event template blueprint.
 * Visually distinct from EventCard (no date/status chip, includes template badge, description, and agenda item count).
 */
export default function TemplateCard({ template, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { id, name, description, type, tone, updatedAt } = template;
  const itemCount = template.agendaItemsCount ?? template._count?.agendaItems ?? 0;

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setDeleting(true);
    try {
      await onDelete(id);
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  };

  const formattedUpdated = updatedAt
    ? new Date(updatedAt).toLocaleDateString([], {
        dateStyle: 'medium',
      })
    : null;

  return (
    <div
      style={{
        backgroundColor: 'var(--organizer-surface)',
        border: '1px solid var(--organizer-border)',
        borderLeft: '4px solid #818cf8',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'border-color var(--transition-fast)',
      }}
    >
      <div style={{ textAlign: 'left', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.15rem 0.55rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(129, 140, 248, 0.35)',
              color: '#c7d2fe',
              fontWeight: 700,
              letterSpacing: '0.02em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>📐</span> Template
          </span>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            {name}
          </h3>

          {tone && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--organizer-bg)',
                border: '1px solid var(--organizer-border)',
                color: 'var(--organizer-accent)',
                textTransform: 'capitalize',
                fontWeight: 600,
              }}
            >
              {tone}
            </span>
          )}

          {type && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--organizer-bg)',
                border: '1px solid var(--organizer-border)',
                color: 'var(--organizer-text-muted)',
                textTransform: 'capitalize',
              }}
            >
              {type}
            </span>
          )}
        </div>

        {description && (
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--organizer-text-secondary)',
              margin: '0.35rem 0 0.5rem 0',
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
        )}

        <div
          style={{
            fontSize: '0.825rem',
            color: 'var(--organizer-text-secondary)',
            display: 'flex',
            gap: '1.25rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--organizer-text)' }}>
            📋 {itemCount} {itemCount === 1 ? 'agenda item' : 'agenda items'}
          </span>
          {formattedUpdated && <span>Updated {formattedUpdated}</span>}
          <span>
            ID: <code style={{ color: 'var(--organizer-text-muted)' }}>{id}</code>
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <Link to={`/organizer/events/new?templateId=${id}`}>
          <Button variant="primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
            Use Template →
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
                fontSize: '0.825rem',
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
              fontSize: '0.85rem',
            }}
          >
            🗑️ Delete
          </Button>
        )}
      </div>
    </div>
  );
}
