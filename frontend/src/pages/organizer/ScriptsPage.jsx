import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { listScripts, generateAllScripts, pregenerateContingency } from '../../api/scripts';
import { listAgendaItems } from '../../api/agenda';
import ScriptCard from '../../components/organizer/ScriptCard';
import ScriptGenerateForm from '../../components/organizer/ScriptGenerateForm';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorBanner from '../../components/shared/ErrorBanner';

export default function ScriptsPage() {
  const { id: eventId } = useParams();
  const [scripts, setScripts] = useState([]);
  const [agendaItems, setAgendaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(null); // 'all' | 'contingency' | null
  const [batchSummary, setBatchSummary] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchScriptData = async () => {
    setErrorMsg(null);
    try {
      const [scriptsRes, agendaRes] = await Promise.all([
        listScripts(eventId),
        listAgendaItems(eventId),
      ]);
      setScripts(Array.isArray(scriptsRes) ? scriptsRes : []);
      setAgendaItems(Array.isArray(agendaRes) ? agendaRes : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load scripts or agenda items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchScriptData();
    }
  }, [eventId]);

  const handleGenerateAll = async () => {
    setBatchLoading('all');
    setErrorMsg(null);
    try {
      const res = await generateAllScripts(eventId);
      const summaryText = `${res.generated ?? 0} generated, ${res.failed ?? 0} failed`;
      setBatchSummary(summaryText);
      await fetchScriptData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate all scripts.');
    } finally {
      setBatchLoading(null);
    }
  };

  const handlePregenerateContingency = async () => {
    setBatchLoading('contingency');
    setErrorMsg(null);
    try {
      const res = await pregenerateContingency(eventId);
      const summaryText = `${res.generated ?? 0} generated, ${res.failed ?? 0} failed`;
      setBatchSummary(summaryText);
      await fetchScriptData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to pre-generate contingency scripts.');
    } finally {
      setBatchLoading(null);
    }
  };

  const handleSingleGenerateSuccess = (newScriptResult) => {
    // newScriptResult is { script, source }
    setScripts((prev) => [newScriptResult, ...prev]);
  };

  const handleCardUpdateSuccess = (updatedScript) => {
    setScripts((prev) =>
      prev.map((item) => {
        const itemObj = item.script ? item.script : item;
        if (itemObj.id === updatedScript.id) {
          return item.script ? { ...item, script: updatedScript } : updatedScript;
        }
        return item;
      })
    );
  };

  return (
    <div style={{ textAlign: 'left' }}>
      {/* Page Header & Batch Generation Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="organizer-page-title" style={{ margin: 0 }}>AI Teleprompter Script Generator</h2>
          <p className="organizer-page-desc" style={{ margin: '0.25rem 0 0 0' }}>
            Generate, view, and edit AI teleprompter cues and contingency scripts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button
            variant="primary"
            onClick={handleGenerateAll}
            disabled={Boolean(batchLoading)}
          >
            {batchLoading === 'all' ? 'Generating All...' : '⚡ Generate All Scripts'}
          </Button>

          <Button
            variant="secondary"
            onClick={handlePregenerateContingency}
            disabled={Boolean(batchLoading)}
          >
            {batchLoading === 'contingency' ? 'Generating Contingency...' : '🛡️ Pre-generate Contingency Scripts'}
          </Button>
        </div>
      </div>

      {/* Batch Operation Summary Notification */}
      {batchSummary && (
        <div style={{
          marginBottom: '1.25rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--organizer-success)',
          fontSize: '0.9rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>✨ Batch Generation Result: <strong>{batchSummary}</strong></span>
          <button
            onClick={() => setBatchSummary(null)}
            style={{ background: 'none', border: 'none', color: 'var(--organizer-text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && <ErrorBanner message={errorMsg} style={{ marginBottom: '1.5rem' }} />}

      {/* Single Script Generation Form */}
      <ScriptGenerateForm
        eventId={eventId}
        agendaItems={agendaItems}
        onGenerateSuccess={handleSingleGenerateSuccess}
      />

      {/* Scripts Directory List */}
      {loading ? (
        <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <LoadingSpinner label="Fetching generated scripts directory..." />
        </div>
      ) : scripts.length === 0 ? (
        <div className="organizer-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📜</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
            No scripts generated yet
          </h3>
          <p style={{ color: 'var(--organizer-text-secondary)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            Use the form above or click <strong>Generate All Scripts</strong> to produce teleprompter scripts for your stage flow.
          </p>
        </div>
      ) : (
        <div>
          {scripts.map((item, idx) => {
            const itemObj = item.script ? item.script : item;
            const key = itemObj.id || `script-idx-${idx}`;
            return (
              <ScriptCard
                key={key}
                scriptItem={item}
                onUpdateSuccess={handleCardUpdateSuccess}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
