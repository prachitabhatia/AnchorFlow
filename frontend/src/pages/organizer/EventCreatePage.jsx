import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createEvent } from '../../api/events';
import Button from '../../components/shared/Button';
import ErrorBanner from '../../components/shared/ErrorBanner';
import '../../styles/organizer.css';

export default function EventCreatePage() {
  const navigate = useNavigate();

  // Form state
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

          {errorMsg && <ErrorBanner message={errorMsg} style={{ marginBottom: '1.5rem' }} />}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label htmlFor="event-name" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}>
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
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label htmlFor="event-type" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}>
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
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label htmlFor="event-tone" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}>
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
                  outline: 'none'
                }}
              >
                <option value="formal">formal</option>
                <option value="casual">casual</option>
                <option value="energetic">energetic</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label htmlFor="event-date" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}>
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
                  outline: 'none'
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
