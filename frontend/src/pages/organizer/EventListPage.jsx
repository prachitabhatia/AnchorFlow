import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listEvents, deleteEvent } from '../../api/events';
import { useOrganizerAuth } from '../../hooks/useOrganizerAuth';
import EventCard from '../../components/organizer/EventCard';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import '../../styles/organizer.css';

export default function EventListPage() {
  const { logout } = useOrganizerAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await listEvents();
      // Ensure array and newest first if timestamps exist
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load events list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((evt) => evt.id !== id));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete event.');
      throw err; // rethrow to reset card loading state
    }
  };

  return (
    <div className="organizer-shell">
      <header className="organizer-top-bar">
        <div className="organizer-brand">
          <span style={{ fontSize: '1.25rem' }}>🎛️</span>
          <h1 className="organizer-brand-title">AnchorFlow Control Room</h1>
        </div>
        <div>
          <button onClick={logout} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
            🔒 Lock Control Room
          </button>
        </div>
      </header>

      <main className="organizer-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="organizer-page-title" style={{ margin: 0 }}>Event Directory</h2>
            <p className="organizer-page-desc" style={{ margin: 0, marginTop: '0.25rem' }}>
              Manage your live stage events, agendas, and anchor teleprompters.
            </p>
          </div>
          <Link to="/organizer/events/new">
            <Button variant="primary">+ Create New Event</Button>
          </Link>
        </div>

        {errorMsg && <ErrorBanner message={errorMsg} style={{ marginBottom: '1.5rem' }} />}

        {loading ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <LoadingSpinner label="Fetching event directory from database..." />
          </div>
        ) : events.length === 0 ? (
          <div className="organizer-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
              No events yet — create one
            </h3>
            <p style={{ color: 'var(--organizer-text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Get started by scaffolding a new live stage event with custom speakers, agenda, and AI scripts.
            </p>
            <Link to="/organizer/events/new">
              <Button variant="primary">+ Create Event</Button>
            </Link>
          </div>
        ) : (
          <div>
            {events.map((evt) => (
              <EventCard key={evt.id} event={evt} onDelete={handleDeleteEvent} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
