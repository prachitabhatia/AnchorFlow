import { useState } from 'react';
import { createSpeaker, updateSpeaker } from '../../api/speakers';
import Button from '../shared/Button';
import ErrorBanner from '../shared/ErrorBanner';

export default function SpeakerForm({ eventId, speaker, onSuccess, onCancel }) {
  const isEditing = Boolean(speaker && speaker.id);

  const [formData, setFormData] = useState({
    name: speaker?.name || '',
    role: speaker?.role || '',
    organization: speaker?.organization || '',
    bio: speaker?.bio || '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const bioCharCount = formData.bio ? formData.bio.trim().length : 0;
  const isBioValid = bioCharCount >= 20;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isBioValid) return;

    setErrorMsg(null);
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        role: formData.role.trim(),
        organization: formData.organization.trim(),
        bio: formData.bio.trim(),
      };

      let result;
      if (isEditing) {
        result = await updateSpeaker(speaker.id, payload);
      } else {
        result = await createSpeaker(eventId, payload);
      }

      setLoading(false);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to save speaker. Please check input limits.');
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
          {isEditing ? `Edit Speaker: ${speaker.name}` : 'Add New Speaker'}
        </h3>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={loading} style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem' }}>
            ✕ Close
          </Button>
        )}
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} style={{ marginBottom: '1.25rem' }} />}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label htmlFor="speaker-name" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}>
              Full Name <span style={{ color: 'var(--organizer-danger)' }}>*</span>
            </label>
            <input
              id="speaker-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Dr. Aris Thorne"
              maxLength={120}
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
            <label htmlFor="speaker-role" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}>
              Role / Title <span style={{ color: 'var(--organizer-danger)' }}>*</span>
            </label>
            <input
              id="speaker-role"
              name="role"
              type="text"
              value={formData.role}
              onChange={handleChange}
              placeholder="e.g. Chief AI Scientist"
              maxLength={120}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', gridColumn: '1 / -1' }}>
            <label htmlFor="speaker-org" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}>
              Organization / Company <span style={{ color: 'var(--organizer-danger)' }}>*</span>
            </label>
            <input
              id="speaker-org"
              name="organization"
              type="text"
              value={formData.organization}
              onChange={handleChange}
              placeholder="e.g. Quantum Dynamics Institute"
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
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="speaker-bio" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}>
              Speaker Biography & Achievements <span style={{ color: 'var(--organizer-danger)' }}>*</span>
            </label>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: isBioValid ? 'var(--organizer-success)' : 'var(--organizer-warning)'
            }}>
              {bioCharCount} / 20 minimum
            </span>
          </div>

          <textarea
            id="speaker-bio"
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Provide background, credentials, and achievements for AI script generation..."
            maxLength={1500}
            disabled={loading}
            required
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--organizer-bg)',
              border: `1px solid ${isBioValid ? 'var(--organizer-border)' : 'var(--organizer-warning)'}`,
              color: 'var(--organizer-text)',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none'
            }}
          />

          <p style={{
            fontSize: '0.8rem',
            color: isBioValid ? 'var(--organizer-text-muted)' : 'var(--organizer-warning)',
            margin: '0.2rem 0 0 0',
            fontStyle: 'italic'
          }}>
            💡 AI introductions need real detail about this speaker's experience
          </p>
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
            disabled={loading || !isBioValid || !formData.name.trim() || !formData.role.trim() || !formData.organization.trim()}
          >
            {loading ? 'Saving Speaker...' : isEditing ? 'Update Speaker' : 'Add Speaker'}
          </Button>
        </div>
      </form>
    </div>
  );
}
