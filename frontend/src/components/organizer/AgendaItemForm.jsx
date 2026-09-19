import { useState } from 'react';
import { createAgendaItem, updateAgendaItem } from '../../api/agenda';
import Button from '../shared/Button';
import ErrorBanner from '../shared/ErrorBanner';

export default function AgendaItemForm({ eventId, item, speakers = [], onSuccess, onCancel }) {
  const isEditing = Boolean(item && item.id);

  // Format initial plannedStart date for datetime-local input
  const formatInitialDate = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    title: item?.title || '',
    type: item?.type || 'Presentation',
    speakerId: item?.speakerId || '',
    plannedStart: formatInitialDate(item?.plannedStart),
    durationMinutes: item?.durationMinutes || 15,
    isBuffer: item?.isBuffer || false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      let isoPlannedStart = '';
      if (formData.plannedStart) {
        const parsed = new Date(formData.plannedStart);
        if (!isNaN(parsed.getTime())) {
          isoPlannedStart = parsed.toISOString();
        }
      }

      const payload = {
        title: formData.title.trim(),
        type: formData.type.trim(),
        speakerId: formData.speakerId ? formData.speakerId : null,
        plannedStart: isoPlannedStart,
        durationMinutes: Number(formData.durationMinutes),
        isBuffer: Boolean(formData.isBuffer),
      };

      let result;
      if (isEditing) {
        result = await updateAgendaItem(item.id, payload);
      } else {
        result = await createAgendaItem(eventId, payload);
      }

      setLoading(false);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to save agenda item.');
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--organizer-surface)',
      border: '1px solid var(--organizer-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.75rem',
      marginBottom: '1.5rem',
      boxShadow: 'var(--shadow-md)',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
          {isEditing ? `Edit Session: ${item.title}` : 'Add Agenda Session'}
        </h3>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={loading} style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem' }}>
            ✕ Close
          </Button>
        )}
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} style={{ marginBottom: '1.25rem' }} />}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', gridColumn: '1 / -1' }}>
            <label htmlFor="agenda-title" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}>
              Session Title <span style={{ color: 'var(--organizer-danger)' }}>*</span>
            </label>
            <input
              id="agenda-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Opening Keynote: The Future of Autonomous Agents"
              maxLength={160}
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
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label htmlFor="agenda-type" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}>
              Session Type <span style={{ color: 'var(--organizer-danger)' }}>*</span>
            </label>
            <input
              id="agenda-type"
              name="type"
              type="text"
              value={formData.type}
              onChange={handleChange}
              placeholder="e.g. Keynote, Break, Panel, Fireside Chat"
              maxLength={40}
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
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label htmlFor="agenda-speaker" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}>
              Assigned Speaker
            </label>
            <select
              id="agenda-speaker"
              name="speakerId"
              value={formData.speakerId}
              onChange={handleChange}
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
              <option value="">No speaker (unassigned)</option>
              {speakers.map((spk) => (
                <option key={spk.id} value={spk.id}>
                  {spk.name} ({spk.role} @ {spk.organization})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label htmlFor="agenda-start" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}>
              Planned Start Time <span style={{ color: 'var(--organizer-danger)' }}>*</span>
            </label>
            <input
              id="agenda-start"
              name="plannedStart"
              type="datetime-local"
              value={formData.plannedStart}
              onChange={handleChange}
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
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label htmlFor="agenda-duration" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}>
              Duration (Minutes) <span style={{ color: 'var(--organizer-danger)' }}>*</span>
            </label>
            <input
              id="agenda-duration"
              name="durationMinutes"
              type="number"
              min={1}
              max={480}
              value={formData.durationMinutes}
              onChange={handleChange}
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
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
          <input
            id="agenda-buffer"
            name="isBuffer"
            type="checkbox"
            checked={formData.isBuffer}
            onChange={handleChange}
            disabled={loading}
            style={{ width: '16px', height: '16px', accentColor: 'var(--organizer-accent)', cursor: 'pointer' }}
          />
          <label htmlFor="agenda-buffer" style={{ fontSize: '0.875rem', color: 'var(--organizer-text)', cursor: 'pointer' }}>
            Mark as Buffer Segment (flexible delay absorber / break period)
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !formData.title.trim() || !formData.type.trim() || !formData.plannedStart}
          >
            {loading ? 'Saving Session...' : isEditing ? 'Update Session' : 'Add Session'}
          </Button>
        </div>
      </form>
    </div>
  );
}
