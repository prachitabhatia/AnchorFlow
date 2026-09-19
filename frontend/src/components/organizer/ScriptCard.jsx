import { useState } from 'react';
import { updateScript } from '../../api/scripts';
import Button from '../shared/Button';
import ErrorBanner from '../shared/ErrorBanner';

export default function ScriptCard({ scriptItem, onUpdateSuccess }) {
  // scriptItem can be a script object or { script, source } envelope
  const script = scriptItem.script ? scriptItem.script : scriptItem;
  const initialSource = scriptItem.source || scriptItem.sourceType || 'ai';

  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(script.content || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Four visually distinct, non-alarming source badge styles
  const getSourceBadgeStyle = (src) => {
    switch (src) {
      case 'ai':
        return {
          bg: 'rgba(56, 189, 248, 0.15)',
          color: '#38bdf8',
          border: 'rgba(56, 189, 248, 0.35)',
          label: 'AI Generated',
        };
      case 'fallback':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#f59e0b',
          border: 'rgba(245, 158, 11, 0.35)',
          label: 'Template Fallback',
        };
      case 'cached':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          border: 'rgba(16, 185, 129, 0.35)',
          label: 'Cached Contingency',
        };
      case 'hardcoded':
      default:
        return {
          bg: 'rgba(99, 102, 241, 0.15)',
          color: '#818cf8',
          border: 'rgba(99, 102, 241, 0.35)',
          label: 'Default Script',
        };
    }
  };

  const badgeStyle = getSourceBadgeStyle(initialSource);

  const handleSave = async () => {
    if (!content.trim()) return;

    setErrorMsg(null);
    setLoading(true);

    try {
      // Body MUST be EXACTLY { content }
      const updated = await updateScript(script.id, content.trim());
      setLoading(false);
      setEditing(false);

      if (onUpdateSuccess) {
        onUpdateSuccess(updated);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to update script content.');
    }
  };

  const handleCancel = () => {
    setContent(script.content || '');
    setEditing(false);
    setErrorMsg(null);
  };

  return (
    <div style={{
      backgroundColor: 'var(--organizer-surface)',
      border: '1px solid var(--organizer-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem 1.5rem',
      marginBottom: '1rem',
      boxShadow: 'var(--shadow-sm)',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: 0, textTransform: 'capitalize' }}>
            📜 {script.type ? script.type.replace('_', ' ') : 'Script'}
          </h4>

          {/* Source Resilience Badge */}
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: badgeStyle.bg,
            color: badgeStyle.color,
            border: `1px solid ${badgeStyle.border}`,
            textTransform: 'capitalize'
          }}>
            {badgeStyle.label}
          </span>
        </div>

        {!editing && (
          <Button
            onClick={() => setEditing(true)}
            variant="secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          >
            ✏️ Edit Content
          </Button>
        )}
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} style={{ marginBottom: '0.75rem' }} />}

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--organizer-bg)',
              border: '1px solid var(--organizer-accent)',
              color: 'var(--organizer-text)',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="secondary" onClick={handleCancel} disabled={loading} style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={loading || !content.trim()} style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}>
              {loading ? 'Saving...' : 'Save Script'}
            </Button>
          </div>
        </div>
      ) : (
        <div style={{
          fontSize: '0.9rem',
          color: 'var(--organizer-text)',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(51, 65, 85, 0.4)'
        }}>
          {content}
        </div>
      )}
    </div>
  );
}
