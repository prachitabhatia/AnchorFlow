import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { listSpeakers, deleteSpeaker } from '../../api/speakers';
import SpeakerCard from '../../components/organizer/SpeakerCard';
import SpeakerForm from '../../components/organizer/SpeakerForm';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorBanner from '../../components/shared/ErrorBanner';

export default function SpeakersPage() {
  const { id: eventId } = useParams();
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form modal/inline toggle state: null | 'create' | speakerObject
  const [formMode, setFormMode] = useState(null);

  const fetchSpeakers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await listSpeakers(eventId);
      setSpeakers(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load speakers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchSpeakers();
    }
  }, [eventId]);

  const handleFormSuccess = () => {
    setFormMode(null);
    fetchSpeakers();
  };

  const handleDeleteSpeaker = async (speakerId) => {
    try {
      await deleteSpeaker(speakerId);
      setSpeakers((prev) => prev.filter((s) => s.id !== speakerId));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete speaker.');
      throw err;
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="organizer-page-title" style={{ margin: 0 }}>Speaker Management</h2>
          <p className="organizer-page-desc" style={{ margin: '0.25rem 0 0 0' }}>
            Configure speakers, bios, and credentials for event introductions and teleprompter scripts.
          </p>
        </div>

        {formMode === null && (
          <Button variant="primary" onClick={() => setFormMode('create')}>
            + Add Speaker
          </Button>
        )}
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} style={{ marginBottom: '1.5rem' }} />}

      {/* Render SpeakerForm when adding or editing */}
      {formMode !== null && (
        <SpeakerForm
          eventId={eventId}
          speaker={typeof formMode === 'object' ? formMode : null}
          onSuccess={handleFormSuccess}
          onCancel={() => setFormMode(null)}
        />
      )}

      {loading ? (
        <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <LoadingSpinner label="Loading speaker roster..." />
        </div>
      ) : speakers.length === 0 ? (
        <div className="organizer-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎤</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
            No speakers added yet
          </h3>
          <p style={{ color: 'var(--organizer-text-secondary)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            Add speakers with detailed biographies to auto-generate personalized stage introductions.
          </p>
          {formMode === null && (
            <Button variant="primary" onClick={() => setFormMode('create')}>
              + Add Speaker
            </Button>
          )}
        </div>
      ) : (
        <div>
          {speakers.map((spk) => (
            <SpeakerCard
              key={spk.id}
              speaker={spk}
              onEdit={(speakerObj) => setFormMode(speakerObj)}
              onDelete={handleDeleteSpeaker}
            />
          ))}
        </div>
      )}
    </div>
  );
}
