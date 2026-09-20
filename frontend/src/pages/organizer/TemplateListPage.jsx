import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listTemplates, deleteTemplate } from '../../api/templates';
import { useOrganizerAuth } from '../../hooks/useOrganizerAuth';
import TemplateCard from '../../components/organizer/TemplateCard';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import '../../styles/organizer.css';

export default function TemplateListPage() {
  const { logout } = useOrganizerAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchTemplates = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await listTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load templates list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDeleteTemplate = async (id) => {
    try {
      await deleteTemplate(id);
      setTemplates((prev) => prev.filter((tpl) => tpl.id !== id));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete template.');
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
          <Button
            type="button"
            variant="secondary"
            onClick={logout}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
          >
            🔒 Lock Control Room
          </Button>
        </div>
      </header>

      <main className="organizer-content">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2 className="organizer-page-title" style={{ margin: 0 }}>
              Saved Templates
            </h2>
            <p className="organizer-page-desc" style={{ margin: 0, marginTop: '0.25rem' }}>
              Reusable event structures, agendas, and timing blueprints.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/organizer/events">
              <Button variant="secondary">← Back to Events</Button>
            </Link>
          </div>
        </div>

        {errorMsg && <ErrorBanner message={errorMsg} style={{ marginBottom: '1.5rem' }} />}

        {loading ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <LoadingSpinner label="Fetching saved templates from database..." />
          </div>
        ) : templates.length === 0 ? (
          <div className="organizer-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📐</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
              No templates saved yet
            </h3>
            <p
              style={{
                color: 'var(--organizer-text-secondary)',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                maxWidth: '480px',
                margin: '0 auto 1.5rem auto',
                lineHeight: 1.5,
              }}
            >
              Build an event, then save it as a template to reuse its structure, timing, and agenda items for future
              events.
            </p>
            <Link to="/organizer/events">
              <Button variant="primary">View Events</Button>
            </Link>
          </div>
        ) : (
          <div>
            {templates.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={{
                  ...tpl,
                  agendaItemsCount: tpl.agendaItemsCount ?? tpl._count?.agendaItems ?? 0,
                }}
                onDelete={handleDeleteTemplate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
