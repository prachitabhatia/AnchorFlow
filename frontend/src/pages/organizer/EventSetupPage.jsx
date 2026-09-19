import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEvent } from '../../api/events';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import Button from '../../components/shared/Button';

export default function EventSetupPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchEventDetails() {
      setLoading(true);
      setErrorMsg(null);
      setNotFound(false);

      try {
        const data = await getEvent(id);
        if (isMounted) {
          setEvent(data);
        }
      } catch (err) {
        if (isMounted) {
          if (err.status === 404) {
            setNotFound(true);
          } else {
            setErrorMsg(err.message || 'Failed to load event details.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchEventDetails();
    }

    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <LoadingSpinner label={`Loading configuration for event ${id}...`} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="organizer-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>❓</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--organizer-danger)', marginBottom: '0.5rem' }}>
          Event Not Found
        </h2>
        <p style={{ color: 'var(--organizer-text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          No event exists with ID <code style={{ color: 'var(--organizer-accent)' }}>{id}</code>. It may have been deleted.
        </p>
        <Link to="/organizer/events">
          <Button variant="primary">← Return to Events Directory</Button>
        </Link>
      </div>
    );
  }

  if (errorMsg) {
    return <ErrorBanner message={errorMsg} style={{ marginBottom: '1.5rem' }} />;
  }

  const formattedDate = event?.date
    ? new Date(event.date).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })
    : 'Not Scheduled';

  const agendaCount = Array.isArray(event?.agendaItems) ? event.agendaItems.length : 0;
  const speakerCount = Array.isArray(event?.speakers) ? event.speakers.length : 0;

  return (
    <div className="organizer-card" style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="organizer-page-title">{event.name}</h2>
          <p className="organizer-page-desc" style={{ margin: 0 }}>
            Type: <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{event.type}</strong> &nbsp;|&nbsp;
            Tone: <strong style={{ color: 'var(--organizer-accent)', textTransform: 'capitalize' }}>{event.tone}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/organizer/events/${id}/live`}>
            <Button variant="primary">🔴 Enter Live Control</Button>
          </Link>
          <Link to={`/anchor/${id}`} target="_blank">
            <Button variant="secondary">📺 Open Public Anchor Screen</Button>
          </Link>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ backgroundColor: 'var(--organizer-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--organizer-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--organizer-text-muted)', uppercase: true, fontWeight: 600 }}>Scheduled Date</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--organizer-text)', marginTop: '0.25rem' }}>{formattedDate}</div>
        </div>

        <div style={{ backgroundColor: 'var(--organizer-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--organizer-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--organizer-text-muted)', uppercase: true, fontWeight: 600 }}>Speakers Configured</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--organizer-accent)', marginTop: '0.25rem' }}>{speakerCount} speakers</div>
        </div>

        <div style={{ backgroundColor: 'var(--organizer-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--organizer-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--organizer-text-muted)', uppercase: true, fontWeight: 600 }}>Agenda Sessions</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--organizer-success)', marginTop: '0.25rem' }}>{agendaCount} sessions</div>
        </div>
      </div>

      <div style={{
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        border: '1px solid rgba(2, 132, 199, 0.3)',
        color: 'var(--organizer-text-secondary)',
        fontSize: '0.875rem'
      }}>
        💡 <strong>Setup Workspace:</strong> Use the sub-navigation tabs above (<strong>Speakers</strong>, <strong>Agenda</strong>, <strong>Scripts</strong>) to configure stage assets for this event.
      </div>
    </div>
  );
}
