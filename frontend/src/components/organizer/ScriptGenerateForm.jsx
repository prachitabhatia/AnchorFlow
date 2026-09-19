import { useState } from 'react';
import { generateScript } from '../../api/scripts';
import Button from '../shared/Button';
import ErrorBanner from '../shared/ErrorBanner';

const SCRIPT_TYPES = [
  { value: 'opening', label: 'Opening Remarks', needsAgenda: false },
  { value: 'intro', label: 'Speaker Introduction', needsAgenda: true },
  { value: 'activity_intro', label: 'Activity Introduction', needsAgenda: true },
  { value: 'transition', label: 'Transition', needsAgenda: true },
  { value: 'filler', label: 'Filler / Delay Absorber', needsAgenda: true },
  { value: 'announcement', label: 'Announcement', needsAgenda: false },
  { value: 'closing', label: 'Closing Remarks', needsAgenda: false },
];

export default function ScriptGenerateForm({ eventId, agendaItems = [], onGenerateSuccess }) {
  const [selectedType, setSelectedType] = useState('opening');
  const [selectedAgendaId, setSelectedAgendaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const currentTypeConfig = SCRIPT_TYPES.find((t) => t.value === selectedType);
  const showAgendaPicker = currentTypeConfig ? currentTypeConfig.needsAgenda : false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const payload = {
        eventId,
        type: selectedType,
        agendaItemId: showAgendaPicker && selectedAgendaId ? selectedAgendaId : undefined,
      };

      const result = await generateScript(payload);
      setLoading(false);

      // Reset form
      setSelectedAgendaId('');

      if (onGenerateSuccess) {
        onGenerateSuccess(result);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to generate script.');
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--organizer-surface)',
      border: '1px solid var(--organizer-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: 'var(--shadow-md)',
      textAlign: 'left'
    }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
        ✨ Generate Single Teleprompter Script
      </h3>

      {errorMsg && <ErrorBanner message={errorMsg} style={{ marginBottom: '1rem' }} />}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label htmlFor="script-type-select" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}>
              Script Type <span style={{ color: 'var(--organizer-danger)' }}>*</span>
            </label>
            <select
              id="script-type-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={loading}
              required
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--organizer-bg)',
                border: '1px solid var(--organizer-border)',
                color: 'var(--organizer-text)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            >
              {SCRIPT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} ({t.value})
                </option>
              ))}
            </select>
          </div>

          {showAgendaPicker && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="script-agenda-select" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}>
                Target Agenda Session
              </label>
              <select
                id="script-agenda-select"
                value={selectedAgendaId}
                onChange={(e) => setSelectedAgendaId(e.target.value)}
                disabled={loading}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--organizer-bg)',
                  border: '1px solid var(--organizer-border)',
                  color: 'var(--organizer-text)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                <option value="">No specific session (General)</option>
                {agendaItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} ({item.type})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Generating Script...' : '✨ Generate Script'}
          </Button>
        </div>
      </form>
    </div>
  );
}
