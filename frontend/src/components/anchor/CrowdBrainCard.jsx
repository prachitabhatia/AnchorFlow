import React from 'react';

const REACTIONS = [
  { id: 'amazing', label: 'Amazing', emoji: '🔥' },
  { id: 'good', label: 'Good', emoji: '🙂' },
  { id: 'mid', label: 'Mid', emoji: '😐' },
  { id: 'boring', label: 'Boring', emoji: '😴' },
  { id: 'confusing', label: 'Confusing', emoji: '😕' },
];

export default function CrowdBrainCard({
  aggregate,
  loading,
  error,
  isRegenerating,
  regenerateResult,
  onRegenerateLine,
}) {
  if (loading && !aggregate) {
    return (
      <div className="anchor-crowd-brain-card">
        <div className="anchor-crowd-brain-header">
          <span className="anchor-crowd-brain-badge">🧠 CROWD BRAIN AI</span>
          <span className="anchor-crowd-brain-status">Loading crowd feedback...</span>
        </div>
      </div>
    );
  }

  if (error && !aggregate) {
    return (
      <div className="anchor-crowd-brain-card">
        <div className="anchor-crowd-brain-header">
          <span className="anchor-crowd-brain-badge">🧠 CROWD BRAIN AI</span>
          <span className="anchor-crowd-brain-status error">{error}</span>
        </div>
      </div>
    );
  }

  if (!aggregate) {
    return null; // Render nothing if no active aggregate segment
  }

  const { segmentTitle, totalResponses = 0, counts = {}, percentages = {}, crowdBrain } = aggregate;
  const hasResponses = totalResponses > 0;

  return (
    <div className="anchor-crowd-brain-card">
      <style>{`
        .anchor-crowd-brain-card {
          width: 100%;
          max-width: 1100px;
          background-color: var(--anchor-surface, #131b2e);
          border: 1px solid var(--anchor-border, #263554);
          border-radius: var(--radius-xl, 16px);
          padding: 1.25rem 1.5rem;
          margin: 0.75rem 0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .anchor-crowd-brain-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .anchor-crowd-brain-badge {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--anchor-text-accent, #38bdf8);
          background-color: rgba(56, 189, 248, 0.12);
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-sm, 4px);
          border: 1px solid rgba(56, 189, 248, 0.3);
        }

        .anchor-crowd-brain-segment-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--anchor-text, #ffffff);
          margin: 0;
        }

        .anchor-crowd-brain-response-count {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--anchor-text-secondary, #cbd5e1);
          background-color: var(--anchor-surface-elevated, #1c2744);
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
        }

        .anchor-crowd-brain-breakdown {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 0.5rem;
          width: 100%;
        }

        .anchor-crowd-brain-reaction-item {
          background-color: var(--anchor-surface-elevated, #1c2744);
          border: 1px solid var(--anchor-border, #263554);
          border-radius: var(--radius-md, 8px);
          padding: 0.5rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .reaction-meta {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--anchor-text, #ffffff);
        }

        .reaction-bar-container {
          width: 100%;
          height: 6px;
          background-color: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          overflow: hidden;
        }

        .reaction-bar-fill {
          height: 100%;
          background-color: var(--anchor-text-accent, #38bdf8);
          border-radius: 9999px;
          transition: width 300ms ease;
        }

        .reaction-pct {
          font-size: 0.75rem;
          color: var(--anchor-text-secondary, #cbd5e1);
          font-weight: 600;
        }

        .anchor-crowd-brain-empty-state {
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px dashed var(--anchor-border, #263554);
          border-radius: var(--radius-md, 8px);
          padding: 0.85rem 1rem;
          font-size: 0.85rem;
          color: var(--anchor-text-secondary, #cbd5e1);
          text-align: center;
        }

        .anchor-crowd-brain-ai-section {
          background-color: var(--anchor-surface-elevated, #1c2744);
          border: 1px solid var(--anchor-border, #263554);
          border-radius: var(--radius-lg, 12px);
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .mood-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background-color: rgba(99, 102, 241, 0.2);
          border: 1px solid var(--anchor-accent, #6366f1);
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          color: #a5b4fc;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .stale-caption {
          font-size: 0.75rem;
          color: var(--anchor-text-secondary, #cbd5e1);
          font-style: italic;
          opacity: 0.85;
        }

        .ai-field {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .ai-field-label {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--anchor-text-accent, #38bdf8);
        }

        .ai-field-text {
          font-size: 0.95rem;
          color: var(--anchor-text, #ffffff);
          margin: 0;
          line-height: 1.45;
        }

        .suggested-line-box {
          background-color: rgba(56, 189, 248, 0.08);
          border-left: 3.5px solid var(--anchor-text-accent, #38bdf8);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm, 4px);
        }

        .suggested-line-text {
          font-size: 1.05rem;
          font-weight: 700;
          font-style: italic;
          color: var(--anchor-text, #ffffff);
          margin: 0.25rem 0 0 0;
          line-height: 1.4;
        }

        .ai-action-bar {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-top: 0.25rem;
          flex-wrap: wrap;
        }

        .regenerate-btn {
          background-color: var(--anchor-accent, #6366f1);
          color: #ffffff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md, 8px);
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 150ms ease;
        }

        .regenerate-btn:hover:not(:disabled) {
          background-color: var(--anchor-accent-bright, #818cf8);
        }

        .regenerate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .regenerate-feedback {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .regenerate-feedback.success {
          color: #4ade80;
        }

        .regenerate-feedback.cooldown {
          color: #fbbf24;
        }
      `}</style>

      {/* Header */}
      <div className="anchor-crowd-brain-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="anchor-crowd-brain-badge">🧠 CROWD BRAIN</span>
          <h3 className="anchor-crowd-brain-segment-title">{segmentTitle}</h3>
        </div>
        <span className="anchor-crowd-brain-response-count">
          {totalResponses} {totalResponses === 1 ? 'response' : 'responses'}
        </span>
      </div>

      {/* 5 Reaction Breakdown */}
      <div className="anchor-crowd-brain-breakdown">
        {REACTIONS.map((item) => {
          const pct = percentages[item.id] || 0;
          const count = counts[item.id] || 0;
          return (
            <div key={item.id} className="anchor-crowd-brain-reaction-item">
              <div className="reaction-meta">
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </div>
              <div className="reaction-bar-container">
                <div className="reaction-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="reaction-pct">{pct}% ({count})</span>
            </div>
          );
        })}
      </div>

      {/* AI Insight Section */}
      {!hasResponses ? (
        <div className="anchor-crowd-brain-empty-state">
          💬 No feedback yet for this segment. Audience responses will appear here live.
        </div>
      ) : !crowdBrain ? (
        <div className="anchor-crowd-brain-empty-state">
          📊 Not enough feedback yet to show insights (collecting more responses...).
        </div>
      ) : (
        <div className="anchor-crowd-brain-ai-section">
          <div className="ai-header">
            <div className="mood-badge">
              <span>{crowdBrain.moodEmoji || '✨'}</span>
              <span>MOOD: {(crowdBrain.moodLabel || 'Active').toUpperCase()}</span>
            </div>
            {crowdBrain.isStale && (
              <span className="stale-caption">⏱️ based on earlier responses</span>
            )}
          </div>

          <div className="ai-field">
            <span className="ai-field-label">AUDIENCE INSIGHT</span>
            <p className="ai-field-text">{crowdBrain.insightText}</p>
          </div>

          <div className="ai-field">
            <span className="ai-field-label">STAGE RECOMMENDATION</span>
            <p className="ai-field-text">{crowdBrain.recommendationText}</p>
          </div>

          {crowdBrain.suggestedLine && (
            <div className="ai-field suggested-line-box">
              <span className="ai-field-label">SUGGESTED STAGE LINE</span>
              <blockquote className="suggested-line-text">
                "{crowdBrain.suggestedLine}"
              </blockquote>
            </div>
          )}

          <div className="ai-action-bar">
            <button
              type="button"
              className="regenerate-btn"
              disabled={isRegenerating}
              onClick={onRegenerateLine}
            >
              {isRegenerating ? '🔄 Refreshing line...' : '✨ Regenerate Line'}
            </button>

            {regenerateResult && (
              <span className={`regenerate-feedback ${regenerateResult.regenerated ? 'success' : 'cooldown'}`}>
                {regenerateResult.regenerated
                  ? '✓ Fresh line generated'
                  : '⏱️ Same line — try again in a moment'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
