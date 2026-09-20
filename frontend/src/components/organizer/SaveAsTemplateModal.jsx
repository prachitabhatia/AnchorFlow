import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { saveEventAsTemplate } from '../../api/templates';
import Button from '../shared/Button';
import ErrorBanner from '../shared/ErrorBanner';

/**
 * SaveAsTemplateModal Component
 * Allows organizers to save an existing event's structure and agenda as a reusable template.
 */
export default function SaveAsTemplateModal({
  isOpen,
  onClose,
  eventId,
  eventName = '',
  onSuccess,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTemplate, setCreatedTemplate] = useState(null);

  // Reset form state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setName(eventName ? `${eventName} Template` : '');
      setDescription('');
      setError(null);
      setIsSuccess(false);
      setCreatedTemplate(null);
      setIsSubmitting(false);
    }
  }, [isOpen, eventName]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await saveEventAsTemplate(eventId, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setCreatedTemplate(result);
      setIsSuccess(true);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err.message || 'Failed to save event as template. Please try again.');
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
          textAlign: 'left',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>📐</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--organizer-text)', margin: 0 }}>
              Save as Template
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
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

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '1rem 0 0.5rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--organizer-text)', marginBottom: '0.5rem' }}>
              Template Saved Successfully!
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--organizer-text-secondary)',
                marginBottom: '1.5rem',
                lineHeight: 1.4,
              }}
            >
              <strong>{createdTemplate?.name || name}</strong> has been saved with{' '}
              {createdTemplate?.agendaItems?.length ?? 0} agenda items. You can use it to create new events anytime.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/organizer/events/templates" onClick={onClose} style={{ textDecoration: 'none' }}>
                <Button variant="primary">
                  📐 View Saved Templates →
                </Button>
              </Link>
              <Button type="button" variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--organizer-text-secondary)',
                margin: '0 0 1.25rem 0',
                lineHeight: 1.4,
              }}
            >
              Save this event’s structure, tone, type, and agenda items as a reusable template blueprint.
            </p>

            {error && <ErrorBanner message={error} style={{ marginBottom: '1rem' }} />}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Template Name */}
              <div>
                <label
                  htmlFor="template-name-input"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: 'var(--organizer-text-secondary)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Template Name <span style={{ color: 'var(--organizer-danger)' }}>*</span>
                </label>
                <input
                  id="template-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Standard Hackathon Template"
                  required
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--organizer-bg)',
                    border: '1px solid var(--organizer-border)',
                    color: 'var(--organizer-text)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Template Description */}
              <div>
                <label
                  htmlFor="template-desc-input"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: 'var(--organizer-text-secondary)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Description{' '}
                  <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--organizer-text-muted)' }}>
                    (Optional)
                  </span>
                </label>
                <textarea
                  id="template-desc-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this template structure and intended use..."
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--organizer-bg)',
                    border: '1px solid var(--organizer-border)',
                    color: 'var(--organizer-text)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!name.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : '📐 Save as Template'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
