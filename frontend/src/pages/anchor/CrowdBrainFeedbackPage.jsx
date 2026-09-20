import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSegmentOptions, submitFeedback } from '../../api/crowdBrain';
import ReactionPicker from '../../components/anchor/ReactionPicker';
import '../../styles/anchor.css';

export default function CrowdBrainFeedbackPage() {
  const { eventId } = useParams();
  const [segments, setSegments] = useState([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSegments() {
      setLoading(true);
      setError(null);
      try {
        const data = await getSegmentOptions(eventId);
        if (!isMounted) return;

        const fetchedSegments = data?.segments || [];
        setSegments(fetchedSegments);

        if (fetchedSegments.length > 0) {
          const currentId = data?.currentAgendaItemId;
          const isValidCurrent = currentId && fetchedSegments.some((s) => s.id === currentId);
          setSelectedSegmentId(isValidCurrent ? currentId : fetchedSegments[0].id);
        } else {
          setSelectedSegmentId('');
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load event segments.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSegments();

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const handleReactionSelect = async (reaction) => {
    if (!selectedSegmentId || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await submitFeedback(eventId, {
        agendaItemId: selectedSegmentId,
        reaction,
      });
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="crowd-brain-page">
        <div className="crowd-brain-card">
          <div className="crowd-brain-badge">CONNECTING</div>
          <h2 className="crowd-brain-subtitle">Loading event segments...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="crowd-brain-page">
        <div className="crowd-brain-card error-card">
          <div className="crowd-brain-badge error-badge">ERROR</div>
          <h2 className="crowd-brain-title">Unable to Load Feedback Page</h2>
          <p className="crowd-brain-subtitle">{error}</p>
        </div>
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="crowd-brain-page">
        <div className="crowd-brain-card">
          <div className="crowd-brain-badge">INFO</div>
          <h2 className="crowd-brain-title">No Segments Available</h2>
          <p className="crowd-brain-subtitle">There are no agenda segments configured for this event yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="crowd-brain-page">
      <style>{`
        .crowd-brain-page {
          min-height: 100vh;
          width: 100%;
          box-sizing: border-box;
          padding: 1rem;
          background-color: var(--anchor-bg, #090d16);
          color: var(--anchor-text, #ffffff);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          font-family: var(--font-family, sans-serif);
        }

        .crowd-brain-card {
          width: 100%;
          max-width: 440px;
          margin-top: 1.5rem;
          background-color: var(--anchor-surface, #131b2e);
          border: 1px solid var(--anchor-border, #263554);
          border-radius: var(--radius-xl, 16px);
          padding: 1.75rem 1.25rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .crowd-brain-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .crowd-brain-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          background-color: rgba(99, 102, 241, 0.15);
          border: 1px solid var(--anchor-accent, #6366f1);
          color: var(--anchor-accent-bright, #818cf8);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .crowd-brain-badge.error-badge {
          background-color: rgba(239, 68, 68, 0.15);
          border-color: #ef4444;
          color: #fca5a5;
        }

        .crowd-brain-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--anchor-text, #ffffff);
          margin: 0;
          line-height: 1.2;
        }

        .crowd-brain-subtitle {
          font-size: 0.95rem;
          color: var(--anchor-text-secondary, #cbd5e1);
          margin: 0;
        }

        .crowd-brain-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .crowd-brain-label {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--anchor-text-accent, #38bdf8);
        }

        .crowd-brain-select {
          width: 100%;
          padding: 0.85rem 1rem;
          background-color: var(--anchor-surface-elevated, #1c2744);
          border: 1px solid var(--anchor-border, #263554);
          border-radius: var(--radius-lg, 12px);
          color: var(--anchor-text, #ffffff);
          font-size: 1rem;
          font-weight: 600;
          outline: none;
          box-sizing: border-box;
          cursor: pointer;
          transition: border-color var(--transition-fast, 150ms);
        }

        .crowd-brain-select:focus {
          border-color: var(--anchor-text-accent, #38bdf8);
        }

        .crowd-brain-select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .crowd-brain-success-banner {
          background-color: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.4);
          color: #4ade80;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-lg, 12px);
          font-size: 0.9rem;
          font-weight: 600;
          line-height: 1.4;
          animation: fadeIn 200ms ease-in-out;
        }

        .crowd-brain-error-banner {
          background-color: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #fca5a5;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-lg, 12px);
          font-size: 0.9rem;
          font-weight: 600;
          line-height: 1.4;
        }

        .reaction-picker-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          width: 100%;
          margin-top: 0.25rem;
        }

        .reaction-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 1.1rem 0.5rem;
          background-color: var(--anchor-surface-elevated, #1c2744);
          border: 1.5px solid var(--anchor-border, #263554);
          border-radius: var(--radius-lg, 12px);
          color: var(--anchor-text, #ffffff);
          cursor: pointer;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          transition: background-color 150ms, border-color 150ms, transform 100ms;
        }

        .reaction-button:active:not(:disabled) {
          transform: scale(0.96);
          background-color: rgba(99, 102, 241, 0.25);
          border-color: var(--anchor-accent, #6366f1);
        }

        .reaction-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* 5th option spans across 2 columns for a balanced grid layout */
        .reaction-button:nth-child(5) {
          grid-column: span 2;
        }

        .reaction-emoji {
          font-size: 1.85rem;
          line-height: 1;
        }

        .reaction-label {
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="crowd-brain-card">
        <header className="crowd-brain-header">
          <span className="crowd-brain-badge">LIVE FEEDBACK</span>
          <h1 className="crowd-brain-title">How's it going?</h1>
          <p className="crowd-brain-subtitle">Select a segment and tap a reaction below.</p>
        </header>

        <div className="crowd-brain-field">
          <label htmlFor="segment-select" className="crowd-brain-label">
            Event Segment
          </label>
          <select
            id="segment-select"
            value={selectedSegmentId}
            onChange={(e) => {
              setSelectedSegmentId(e.target.value);
              setSubmitSuccess(false);
            }}
            className="crowd-brain-select"
            disabled={submitting}
          >
            {segments.map((seg) => (
              <option key={seg.id} value={seg.id}>
                {seg.title}
              </option>
            ))}
          </select>
        </div>

        {submitSuccess && (
          <div className="crowd-brain-success-banner" role="status">
            ✓ Thanks! Your feedback helps us improve the event live.
          </div>
        )}

        {submitError && (
          <div className="crowd-brain-error-banner" role="alert">
            {submitError}
          </div>
        )}

        <div className="crowd-brain-picker-wrapper">
          <ReactionPicker
            onSelectReaction={handleReactionSelect}
            disabled={submitting}
          />
        </div>
      </div>
    </div>
  );
}
