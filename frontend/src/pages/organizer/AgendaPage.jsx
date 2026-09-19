import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { listAgendaItems, reorderAgenda, deleteAgendaItem } from '../../api/agenda';
import { listSpeakers } from '../../api/speakers';
import AgendaItemRow from '../../components/organizer/AgendaItemRow';
import AgendaItemForm from '../../components/organizer/AgendaItemForm';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorBanner from '../../components/shared/ErrorBanner';

export default function AgendaPage() {
  const { id: eventId } = useParams();
  const [items, setItems] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form modal state: null | 'create' | itemObject
  const [formMode, setFormMode] = useState(null);

  const fetchAgendaData = async () => {
    setErrorMsg(null);
    try {
      const [agendaRes, speakersRes] = await Promise.all([
        listAgendaItems(eventId),
        listSpeakers(eventId),
      ]);
      setItems(Array.isArray(agendaRes) ? agendaRes : []);
      setSpeakers(Array.isArray(speakersRes) ? speakersRes : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load agenda schedule or speakers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchAgendaData();
    }
  }, [eventId]);

  const handleMoveItem = async (index, direction) => {
    if (reordering) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    // Swap in local array copy
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Extract complete ordered IDs array
    const orderedIds = newItems.map((item) => item.id);

    setReordering(true);
    setErrorMsg(null);

    try {
      await reorderAgenda(eventId, orderedIds);
      // Immediately re-fetch from server to re-render with database-verified state & effective times
      const refreshedItems = await listAgendaItems(eventId);
      setItems(refreshedItems);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reorder agenda items.');
      // Re-fetch to restore original server order on error
      const restoredItems = await listAgendaItems(eventId);
      setItems(restoredItems);
    } finally {
      setReordering(false);
    }
  };

  const handleFormSuccess = () => {
    setFormMode(null);
    fetchAgendaData();
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteAgendaItem(itemId);
      // Re-fetch list to get server reindexed order and effective times
      const refreshedItems = await listAgendaItems(eventId);
      setItems(refreshedItems);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete agenda item.');
      throw err;
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="organizer-page-title" style={{ margin: 0 }}>Agenda & Session Timeline</h2>
          <p className="organizer-page-desc" style={{ margin: '0.25rem 0 0 0' }}>
            Build and reorder session timelines. Effective start/end times are automatically calculated by the backend.
          </p>
        </div>

        {formMode === null && (
          <Button variant="primary" onClick={() => setFormMode('create')}>
            + Add Session
          </Button>
        )}
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} style={{ marginBottom: '1.5rem' }} />}

      {/* Render AgendaItemForm when adding or editing */}
      {formMode !== null && (
        <AgendaItemForm
          eventId={eventId}
          item={typeof formMode === 'object' ? formMode : null}
          speakers={speakers}
          onSuccess={handleFormSuccess}
          onCancel={() => setFormMode(null)}
        />
      )}

      {loading ? (
        <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <LoadingSpinner label="Fetching event timeline and speakers..." />
        </div>
      ) : items.length === 0 ? (
        <div className="organizer-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
            No agenda sessions created yet
          </h3>
          <p style={{ color: 'var(--organizer-text-secondary)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            Add sessions with duration minutes to generate a live stage schedule and teleprompter sequence.
          </p>
          {formMode === null && (
            <Button variant="primary" onClick={() => setFormMode('create')}>
              + Add Session
            </Button>
          )}
        </div>
      ) : (
        <div>
          {items.map((item, idx) => (
            <AgendaItemRow
              key={item.id}
              item={item}
              index={idx}
              totalItems={items.length}
              speakers={speakers}
              onMoveUp={(i) => handleMoveItem(i, 'up')}
              onMoveDown={(i) => handleMoveItem(i, 'down')}
              onEdit={(itemObj) => setFormMode(itemObj)}
              onDelete={handleDeleteItem}
              reordering={reordering}
            />
          ))}
        </div>
      )}
    </div>
  );
}
