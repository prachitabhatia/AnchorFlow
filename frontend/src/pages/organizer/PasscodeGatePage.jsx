import { useState } from 'react';
import { useOrganizerAuth } from '../../hooks/useOrganizerAuth';
import { apiFetch, ApiClientError } from '../../api/client';

export default function PasscodeGatePage({ onSuccess }) {
  const { setPasscode, logout } = useOrganizerAuth();
  const [inputPasscode, setInputPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState({ type: null, message: '' }); // type: '401' | 'network_or_server' | null

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanValue = inputPasscode.trim();
    if (!cleanValue) return;

    setErrorState({ type: null, message: '' });
    setLoading(true);

    // Write to context first so apiFetch reads it from localStorage
    setPasscode(cleanValue);

    try {
      await apiFetch('/events');
      setLoading(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setLoading(false);

      if (err instanceof ApiClientError && err.status === 401) {
        // Clear stored passcode on 401
        logout();
        setErrorState({
          type: '401',
          message: err.message || 'Missing or invalid organizer passcode',
        });
      } else {
        // Keep stored passcode on network or server errors
        setErrorState({
          type: 'network_or_server',
          message: 'Could not verify right now. Please check backend connection or try again.',
        });
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'var(--organizer-bg)',
      color: 'var(--organizer-text)',
      padding: '1.5rem',
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        backgroundColor: 'var(--organizer-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--organizer-border)',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--organizer-accent-glow)',
            color: 'var(--organizer-accent)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            fontSize: '1.5rem'
          }}>
            🔒
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            Organizer Control Room
          </h1>
          <p style={{ color: 'var(--organizer-text-secondary)', fontSize: '0.875rem' }}>
            Enter your organizer passcode to access live controls.
          </p>
        </div>

        {errorState.type && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            backgroundColor: errorState.type === '401' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${errorState.type === '401' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            color: errorState.type === '401' ? 'var(--organizer-danger)' : 'var(--organizer-warning)',
          }}>
            <strong>{errorState.type === '401' ? 'Authentication Failed:' : 'Verification Error:'}</strong>{' '}
            {errorState.message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
            <label
              htmlFor="passcode-input"
              style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--organizer-text-secondary)' }}
            >
              Organizer Passcode
            </label>
            <input
              id="passcode-input"
              type="password"
              value={inputPasscode}
              onChange={(e) => setInputPasscode(e.target.value)}
              placeholder="Enter passcode..."
              disabled={loading}
              autoFocus
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--organizer-bg)',
                border: '1px solid var(--organizer-border)',
                color: 'var(--organizer-text)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color var(--transition-fast)'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !inputPasscode.trim()}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--organizer-accent)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 600,
              border: 'none',
              cursor: loading || !inputPasscode.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !inputPasscode.trim() ? 0.6 : 1,
              transition: 'background-color var(--transition-fast), opacity var(--transition-fast)',
              marginTop: '0.5rem'
            }}
          >
            {loading ? 'Verifying Passcode...' : 'Unlock Control Room'}
          </button>
        </form>
      </div>
    </div>
  );
}
