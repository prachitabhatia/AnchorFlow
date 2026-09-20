import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveEvent } from '../../hooks/useLiveEvent';
import { goLive, advance, pause, resume, endEvent } from '../../api/liveControls';
import StatusBadge from '../../components/organizer/StatusBadge';
import CurrentNextPanel from '../../components/organizer/CurrentNextPanel';
import LiveControlBar from '../../components/organizer/LiveControlBar';
import DelayModal from '../../components/organizer/DelayModal';
import DelayResultCard from '../../components/organizer/DelayResultCard';
import SpeakerArrivalControl from '../../components/organizer/SpeakerArrivalControl';
import AnnouncementComposer from '../../components/organizer/AnnouncementComposer';
import CrowdBrainQrCode from '../../components/organizer/CrowdBrainQrCode';

export default function LiveControlPage() {
  const { id: eventId } = useParams();
  const { snapshot: liveSnapshot, loading, notStarted, error: pollError } = useLiveEvent(eventId);

  const [snapshot, setSnapshot] = useState(null);
  const [closingScript, setClosingScript] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Stage 11 Delay reporting state
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [delayResult, setDelayResult] = useState(null);

  // Sync snapshot with background updates from hook if available
  useEffect(() => {
    if (liveSnapshot) {
      setSnapshot(liveSnapshot);
    }
  }, [liveSnapshot]);

  // Handler for instant liveState updates from components
  const handleLiveStateUpdate = (newLiveState) => {
    if (newLiveState) {
      setSnapshot(newLiveState);
    }
  };

  // Handlers for LiveControlBar
  const handleGoLive = async () => {
    setActionError(null);
    try {
      const newSnapshot = await goLive(eventId);
      setSnapshot(newSnapshot);
      setClosingScript(null);
      setDelayResult(null);
    } catch (err) {
      setActionError(err.message || 'Failed to start event');
    }
  };

  const handleAdvance = async () => {
    setActionError(null);
    try {
      const newSnapshot = await advance(eventId);
      setSnapshot(newSnapshot);
    } catch (err) {
      setActionError(err.message || 'Failed to advance stage');
    }
  };

  const handlePause = async () => {
    setActionError(null);
    try {
      const newSnapshot = await pause(eventId);
      setSnapshot(newSnapshot);
    } catch (err) {
      setActionError(err.message || 'Failed to pause event');
    }
  };

  const handleResume = async () => {
    setActionError(null);
    try {
      const newSnapshot = await resume(eventId);
      setSnapshot(newSnapshot);
    } catch (err) {
      setActionError(err.message || 'Failed to resume event');
    }
  };

  const handleEnd = async () => {
    setActionError(null);
    try {
      // EXPLICIT DESTRUCTURING of { snapshot, closingScript } shape from endEvent
      const { snapshot: newSnapshot, closingScript: newClosingScript } = await endEvent(eventId);
      setSnapshot(newSnapshot);
      if (newClosingScript) {
        setClosingScript(newClosingScript);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to end event');
    }
  };

  // Stage 11 Delay Success Handler
  const handleDelaySuccess = (result) => {
    if (result?.liveState) {
      setSnapshot(result.liveState);
    }
    setDelayResult(result);
  };

  if (loading && !snapshot && !notStarted) {
    return (
      <div className="organizer-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <div className="loading-spinner-container">
          <div className="loading-spinner-icon" />
          <span>Loading stage control room...</span>
        </div>
      </div>
    );
  }

  // Determine current display values
  const effectiveRunState = snapshot?.runState || (notStarted ? 'not_started' : 'not_started');
  const effectiveScheduleStatus = snapshot?.scheduleStatus || null;

  return (
    <div>
      {/* Top Header Card */}
      <div className="organizer-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="organizer-page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔴 Live Stage Control Room
            </h2>
            <p className="organizer-page-desc" style={{ margin: 0 }}>
              Real-time stage direction & instant event status controls.
            </p>
          </div>
          <StatusBadge runState={effectiveRunState} scheduleStatus={effectiveScheduleStatus} />
        </div>
      </div>

      {/* Action Error Alert Banner */}
      {actionError && (
        <div className="error-banner" style={{ marginTop: '1rem' }}>
          <span>⚠️ {actionError}</span>
          <button
            onClick={() => setActionError(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--organizer-danger)',
              cursor: 'pointer',
              fontWeight: '700',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Poll Error (non-404) Notice */}
      {pollError && !notStarted && (
        <div className="error-banner" style={{ marginTop: '1rem', opacity: 0.85 }}>
          <span>⚠️ Network notice: {pollError}</span>
        </div>
      )}

      {/* Main Control Toolbar */}
      <LiveControlBar
        snapshot={snapshot}
        onGoLive={handleGoLive}
        onAdvance={handleAdvance}
        onPause={handlePause}
        onResume={handleResume}
        onEnd={handleEnd}
      />

      {/* Stage 11 Delay Result Card (Renders after successful delay report) */}
      {delayResult && (
        <DelayResultCard
          result={delayResult}
          onDismiss={() => setDelayResult(null)}
        />
      )}

      {/* Current & Next Agenda Segment Panel */}
      <CurrentNextPanel
        current={snapshot?.current}
        next={snapshot?.next}
        runState={effectiveRunState}
      />

      {/* Crowd Brain QR Code for Public Attendee Feedback */}
      <CrowdBrainQrCode eventId={eventId} />

      {/* Closing Script Card (Renders when event ends and closingScript is returned) */}
      {closingScript && (
        <div
          className="organizer-card"
          style={{
            marginTop: '1.25rem',
            border: '1px solid var(--organizer-accent)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📜</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--organizer-text)', margin: 0 }}>
              Event Closing Script
            </h3>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: '600',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                marginLeft: 'auto',
              }}
            >
              GENERATED AT EVENT END
            </span>
          </div>
          <div
            style={{
              backgroundColor: 'var(--organizer-bg)',
              border: '1px solid var(--organizer-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              color: 'var(--organizer-text)',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {closingScript.content}
          </div>
        </div>
      )}

      {/* Stage 11 Stage Adjustments Section */}
      <div
        className="organizer-card"
        style={{
          marginTop: '1.25rem',
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
        }}
      >
        <h4
          style={{
            fontSize: '0.85rem',
            fontWeight: '600',
            color: 'var(--organizer-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
          }}
        >
          ⏱️ Stage Schedule Adjustments
        </h4>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <button
              onClick={() => setIsDelayModalOpen(true)}
              disabled={effectiveRunState !== 'live'}
              className="btn"
              style={{
                backgroundColor: effectiveRunState === 'live' ? 'var(--organizer-warning)' : 'var(--organizer-surface-hover)',
                color: effectiveRunState === 'live' ? '#000000' : 'var(--organizer-text-muted)',
                cursor: effectiveRunState === 'live' ? 'pointer' : 'not-allowed',
                opacity: effectiveRunState === 'live' ? 1 : 0.5,
                fontWeight: '700',
              }}
            >
              ⏱️ Report Delay
            </button>
            {effectiveRunState !== 'live' && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--organizer-warning)',
                  fontWeight: '600',
                  marginTop: '0.35rem',
                }}
              >
                Resume the event to report a delay
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stage 12 Speaker Arrival Control */}
      <SpeakerArrivalControl
        eventId={eventId}
        runState={effectiveRunState}
        onLiveStateUpdate={handleLiveStateUpdate}
      />

      {/* Stage 12 Announcement Composer */}
      <AnnouncementComposer
        eventId={eventId}
        runState={effectiveRunState}
        onLiveStateUpdate={handleLiveStateUpdate}
      />

      {/* Delay Modal Dialog */}
      <DelayModal
        isOpen={isDelayModalOpen}
        onClose={() => setIsDelayModalOpen(false)}
        eventId={eventId}
        currentAgendaItemId={snapshot?.current?.item?.id}
        onSuccess={handleDelaySuccess}
      />
    </div>
  );
}
