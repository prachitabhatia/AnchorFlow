import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createEvent } from '../../api/events';
import { getTemplate, createEventFromTemplate } from '../../api/templates';
import Button from '../../components/shared/Button';
import ErrorBanner from '../../components/shared/ErrorBanner';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import '../../styles/organizer.css';

export default function EventCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('templateId');

  // ==========================================================================
  // Scratch-Creation State & Logic (Preserved exactly as-is for non-template flow)
  // ==========================================================================
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    tone: 'formal', // Default tone option
    date: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      // Backend requireIsoDate expects a full ISO timestamp with timezone.
      // Convert datetime-local string to ISO timestamp via Date object.
      let isoDateString = '';
      if (formData.date) {
        const parsedDate = new Date(formData.date);
        if (!isNaN(parsedDate.getTime())) {
          isoDateString = parsedDate.toISOString();
        }
      }

      const payload = {
        name: formData.name,
        type: formData.type,
        tone: formData.tone,
        date: isoDateString,
      };

      const newEvent = await createEvent(payload);
      setLoading(false);
      navigate(`/organizer/events/${newEvent.id}`);
    } catch (err) {
      setLoading(false);
      // Display backend error message without clearing form values
      setErrorMsg(err.message || 'Failed to create event. Please check inputs.');
    }
  };

  // ==========================================================================
  // Template-Based Creation State & Logic (Stage 3)
  // ==========================================================================
  const [template, setTemplate] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(Boolean(templateId));
  const [templateError, setTemplateError] = useState(null);

  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    date: '',
    tone: 'formal',
    type: '',
  });
  const [templateSubmitting, setTemplateSubmitting] = useState(false);
  const [templateSubmitError, setTemplateSubmitError] = useState(null);

  useEffect(() => {
    if (!templateId) {
      setTemplate(null);
      setTemplateLoading(false);
      return;
    }

    let cancelled = false;
    setTemplateLoading(true);
    setTemplateError(null);

    getTemplate(templateId)
      .then((tpl) => {
        if (!cancelled) {
          setTemplate(tpl);
          setTemplateFormData({
            name: '',
            date: '',
            tone: tpl.tone || 'formal',
            type: tpl.type || '',
          });
          setTemplateLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setTemplateError(err.message || 'Failed to load template.');
          setTemplateLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [templateId]);

  const handleTemplateFormChange = (e) => {
    const { name, value } = e.target;
    setTemplateFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    setTemplateSubmitError(null);
    setTemplateSubmitting(true);

    try {
      // Backend requireIsoDate expects a full ISO timestamp with timezone.
      // Convert datetime-local string to ISO timestamp via Date object (identical conversion).
      let isoDateString = '';
      if (templateFormData.date) {
        const parsedDate = new Date(templateFormData.date);
        if (!isNaN(parsedDate.getTime())) {
          isoDateString = parsedDate.toISOString();
        }
      }

      const payload = {
        name: templateFormData.name,
        date: isoDateString,
      };
      if (templateFormData.tone) payload.tone = templateFormData.tone;
      if (templateFormData.type) payload.type = templateFormData.type;

      const newEvent = await createEventFromTemplate(templateId, payload);
      setTemplateSubmitting(false);
      navigate(`/organizer/events/${newEvent.id}`);
    } catch (err) {
      setTemplateSubmitting(false);
      setTemplateSubmitError(err.message || 'Failed to create event from template.');
    }
  };

  // ==========================================================================
  // RENDER: Template-Based Event Creation Flow
  // ==========================================================================
  if (templateId) {
    return (
      <div className="organizer-shell">
        <header className="organizer-top-bar">
          <div className="organizer-brand">
            <span style={{ fontSize: '1.25rem' }}>🎛️</span>
            <h1 className="organizer-brand-title">AnchorFlow - Create Event from Template</h1>
          </div>
          <Link to="/organizer/events/templates">
            <Button variant="secondary">← Back to Templates</Button>
          </Link>
        </header>

        <main className="organizer-content" style={{ maxWidth: '680px' }}>
          {templateLoading ? (
            <div className="organizer-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <LoadingSpinner label="Loading template details from database..." />
            </div>
          ) : templateError ? (
            <div className="organizer-card">
              <ErrorBanner message={templateError} style={{ marginBottom: '1.5rem' }} />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/organizer/events/templates">
                  <Button variant="secondary">Browse Templates</Button>
                </Link>
                <Link to="/organizer/events/new">
                  <Button variant="primary">Start from Scratch</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="organizer-card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.15rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(129, 140, 248, 0.35)',
                      color: '#c7d2fe',
                      fontWeight: 700,
                    }}
                  >
                    📐 Template Blueprint
                  </span>
                  <h2 className="organizer-page-title" style={{ margin: 0, fontSize: '1.35rem' }}>
                    {template?.name}
                  </h2>
                </div>
                <Link to="/organizer/events/new" style={{ textDecoration: 'none' }}>
                  <Button type="button" variant="secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}>
                    Switch to Scratch
                  </Button>
                </Link>
              </div>

              {template?.description && (
                <p
                  style={{
                    color: 'var(--organizer-text-secondary)',
                    fontSize: '0.9rem',
                    margin: '0 0 1.25rem 0',
                    lineHeight: 1.4,
                  }}
                >
                  {template.description}
                </p>
              )}

              {templateSubmitError && <ErrorBanner message={templateSubmitError} style={{ marginBottom: '1.5rem' }} />}

              <form
                onSubmit={handleTemplateSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}
              >
                {/* Event Name (required) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label
                    htmlFor="event-name"
                    style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}
                  >
                    Event Name <span style={{ color: 'var(--organizer-danger)' }}>*</span>
                  </label>
                  <input
                    id="event-name"
                    name="name"
                    type="text"
                    value={templateFormData.name}
                    onChange={handleTemplateFormChange}
                    placeholder="e.g. Annual Tech Keynote 2026"
                    disabled={templateSubmitting}
                    required
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--organizer-bg)',
                      border: '1px solid var(--organizer-border)',
                      color: 'var(--organizer-text)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Event Date & Time (required) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label
                    htmlFor="event-date"
                    style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}
                  >
                    Event Date & Time <span style={{ color: 'var(--organizer-danger)' }}>*</span>
                  </label>
                  <input
                    id="event-date"
                    name="date"
                    type="datetime-local"
                    value={templateFormData.date}
                    onChange={handleTemplateFormChange}
                    disabled={templateSubmitting}
                    required
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--organizer-bg)',
                      border: '1px solid var(--organizer-border)',
                      color: 'var(--organizer-text)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Optional Overrides for Stage Tone and Event Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label
                      htmlFor="template-event-tone"
                      style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}
                    >
                      Stage Tone{' '}
                      <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--organizer-text-muted)' }}>
                        (Optional override)
                      </span>
                    </label>
                    <select
                      id="template-event-tone"
                      name="tone"
                      value={templateFormData.tone}
                      onChange={handleTemplateFormChange}
                      disabled={templateSubmitting}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--organizer-bg)',
                        border: '1px solid var(--organizer-border)',
                        color: 'var(--organizer-text)',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    >
                      <option value="formal">formal</option>
                      <option value="casual">casual</option>
                      <option value="energetic">energetic</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label
                      htmlFor="template-event-type"
                      style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}
                    >
                      Event Type{' '}
                      <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--organizer-text-muted)' }}>
                        (Optional override)
                      </span>
                    </label>
                    <input
                      id="template-event-type"
                      name="type"
                      type="text"
                      value={templateFormData.type}
                      onChange={handleTemplateFormChange}
                      placeholder="e.g. Conference, Summit"
                      disabled={templateSubmitting}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--organizer-bg)',
                        border: '1px solid var(--organizer-border)',
                        color: 'var(--organizer-text)',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Read-Only Preview of Inherited Agenda Structure */}
                <div
                  style={{
                    marginTop: '0.75rem',
                    borderTop: '1px solid var(--organizer-border)',
                    paddingTop: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>📋</span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                      Inherited Agenda Structure
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--organizer-text-secondary)',
                      margin: '0 0 1rem 0',
                      lineHeight: 1.4,
                    }}
                  >
                    Inherited from <strong>{template?.name}</strong> (
                    {template?.agendaItems?.length || 0} items) — you can add, remove, or reorder these after creating
                    the event.
                  </p>

                  {!template?.agendaItems || template.agendaItems.length === 0 ? (
                    <div
                      style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                        backgroundColor: 'var(--organizer-bg)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed var(--organizer-border)',
                        color: 'var(--organizer-text-muted)',
                        fontSize: '0.875rem',
                      }}
                    >
                      This template has no pre-configured agenda items.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {template.agendaItems.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          style={{
                            backgroundColor: item.isBuffer ? 'rgba(245, 158, 11, 0.08)' : 'var(--organizer-bg)',
                            border: `1px solid ${item.isBuffer ? 'rgba(245, 158, 11, 0.3)' : 'var(--organizer-border)'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <span
                              style={{
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: 'var(--organizer-text-muted)',
                              }}
                            >
                              #{idx + 1}
                            </span>
                            <span style={{ fontSize: '0.925rem', fontWeight: 600, color: '#ffffff' }}>
                              {item.title}
                            </span>
                            {item.isBuffer && (
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  padding: '0.1rem 0.35rem',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                  color: 'var(--organizer-warning)',
                                  border: '1px solid rgba(245, 158, 11, 0.4)',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Buffer
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              fontSize: '0.8rem',
                              color: 'var(--organizer-text-secondary)',
                            }}
                          >
                            <span>🏷️ {item.type}</span>
                            <span style={{ fontWeight: 600 }}>⏱️ {item.durationMinutes} min</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit & Cancel Actions */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={templateSubmitting}
                    style={{ flex: 1, padding: '0.75rem' }}
                  >
                    {templateSubmitting ? 'Creating Event...' : 'Create Event from Template'}
                  </Button>
                  <Link to="/organizer/events/templates" style={{ textDecoration: 'none' }}>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={templateSubmitting}
                      style={{ padding: '0.75rem 1.25rem' }}
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ==========================================================================
  // RENDER: Scratch-Creation Flow (Default when no templateId is present)
  // ==========================================================================
  return (
    <div className="organizer-shell">
      <header className="organizer-top-bar">
        <div className="organizer-brand">
          <span style={{ fontSize: '1.25rem' }}>🎛️</span>
          <h1 className="organizer-brand-title">AnchorFlow - Create Event</h1>
        </div>
        <Link to="/organizer/events">
          <Button variant="secondary">← Back to Events List</Button>
        </Link>
      </header>

      <main className="organizer-content" style={{ maxWidth: '600px' }}>
        <div className="organizer-card">
          <h2 className="organizer-page-title">Create New Event</h2>
          <p className="organizer-page-desc">
            Enter event details to initialize the agenda, speaker roster, and teleprompter scripts.
          </p>

          {/* Creation Mode Choice: Start from Scratch vs Use Saved Template */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              backgroundColor: 'var(--organizer-bg)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--organizer-border)',
            }}
          >
            <Button
              type="button"
              variant="primary"
              style={{
                flex: 1,
                padding: '0.5rem',
                fontSize: '0.875rem',
                cursor: 'default',
              }}
            >
              ✏️ Start from Scratch
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/organizer/events/templates')}
              style={{
                flex: 1,
                padding: '0.5rem',
                fontSize: '0.875rem',
              }}
            >
              📐 Use Saved Template
            </Button>
          </div>

          {errorMsg && <ErrorBanner message={errorMsg} style={{ marginBottom: '1.5rem' }} />}

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label
                htmlFor="event-name"
                style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}
              >
                Event Name <span style={{ color: 'var(--organizer-danger)' }}>*</span>
              </label>
              <input
                id="event-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Annual Tech Keynote 2026"
                disabled={loading}
                required
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--organizer-bg)',
                  border: '1px solid var(--organizer-border)',
                  color: 'var(--organizer-text)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label
                htmlFor="event-type"
                style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}
              >
                Event Type <span style={{ color: 'var(--organizer-danger)' }}>*</span>
              </label>
              <input
                id="event-type"
                name="type"
                type="text"
                value={formData.type}
                onChange={handleChange}
                placeholder="e.g. Conference, Summit, Hackathon"
                disabled={loading}
                required
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--organizer-bg)',
                  border: '1px solid var(--organizer-border)',
                  color: 'var(--organizer-text)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label
                htmlFor="event-tone"
                style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}
              >
                Stage Tone <span style={{ color: 'var(--organizer-danger)' }}>*</span>
              </label>
              <select
                id="event-tone"
                name="tone"
                value={formData.tone}
                onChange={handleChange}
                disabled={loading}
                required
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--organizer-bg)',
                  border: '1px solid var(--organizer-border)',
                  color: 'var(--organizer-text)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              >
                <option value="formal">formal</option>
                <option value="casual">casual</option>
                <option value="energetic">energetic</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label
                htmlFor="event-date"
                style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}
              >
                Event Date & Time <span style={{ color: 'var(--organizer-danger)' }}>*</span>
              </label>
              <input
                id="event-date"
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleChange}
                disabled={loading}
                required
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--organizer-bg)',
                  border: '1px solid var(--organizer-border)',
                  color: 'var(--organizer-text)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                style={{ flex: 1, padding: '0.75rem' }}
              >
                {loading ? 'Creating Event...' : 'Create Event'}
              </Button>
              <Link to="/organizer/events" style={{ textDecoration: 'none' }}>
                <Button type="button" variant="secondary" disabled={loading} style={{ padding: '0.75rem 1.25rem' }}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
