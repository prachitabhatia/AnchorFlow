import { useParams } from 'react-router-dom';
import { useLiveEvent } from '../../hooks/useLiveEvent';
import { useCrowdBrain } from '../../hooks/useCrowdBrain';
import ScriptCard from '../../components/anchor/ScriptCard';
import NextUpBanner from '../../components/anchor/NextUpBanner';
import DelayBanner from '../../components/anchor/DelayBanner';
import PausedOverlay from '../../components/anchor/PausedOverlay';
import EndedScreen from '../../components/anchor/EndedScreen';
import Countdown from '../../components/anchor/Countdown';
import CrowdBrainCard from '../../components/anchor/CrowdBrainCard';
import '../../styles/anchor.css';

export default function AnchorScreen() {
  const { eventId } = useParams();
  const { snapshot, loading, notStarted, serverOffset } = useLiveEvent(eventId);

  const currentAgendaItemId = snapshot?.current?.item?.id || null;

  const {
    aggregate: crowdBrainAggregate,
    loading: crowdBrainLoading,
    error: crowdBrainError,
    isRegenerating,
    regenerateResult,
    triggerRegenerateLine,
  } = useCrowdBrain(eventId, currentAgendaItemId);

  if (loading) {
    return (
      <div className="anchor-screen">
        <div className="anchor-stage-card">
          <div className="anchor-badge">
            <span className="anchor-live-dot" />
            Connecting to Live Stage
          </div>
          <h2 className="anchor-subtitle">Loading stage teleprompter feed...</h2>
        </div>
      </div>
    );
  }

  if (notStarted) {
    return (
      <div className="anchor-screen">
        <div className="anchor-stage-card">
          <div className="anchor-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'var(--anchor-status-warning)', color: 'var(--anchor-status-warning)' }}>
            Stage Inactive
          </div>
          <h1 className="anchor-title">Event has not started yet</h1>
          <p className="anchor-subtitle">
            The organizer control room has not initiated the live stage stream for event <span className="anchor-event-id">{eventId}</span>.
          </p>
        </div>
      </div>
    );
  }

  // Handle Ended State
  if (snapshot?.runState === 'ended') {
    return (
      <EndedScreen
        eventName={snapshot.eventName}
        closingScript={snapshot.current?.script}
      />
    );
  }

  const isPaused = snapshot?.runState === 'paused';
  const isDelayed = snapshot?.scheduleStatus === 'delayed';

  return (
    <div className="anchor-screen" style={{ overflowY: 'auto' }}>
      {/* Paused Overlay */}
      {isPaused && <PausedOverlay />}

      {/* Top Bar / Status Header */}
      <header style={{
        width: '100%',
        maxWidth: '1100px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 0',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="anchor-badge">
            <span className="anchor-live-dot" style={{ backgroundColor: isPaused ? 'var(--anchor-status-warning)' : 'var(--anchor-status-live)' }} />
            {isPaused ? 'PAUSED' : 'LIVE STAGE'}
          </span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--anchor-text)', margin: 0 }}>
            {snapshot?.eventName || 'AnchorFlow'}
          </h2>
        </div>

        {/* Current Segment Details & Per-Second Countdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {snapshot?.current?.item && (
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--anchor-text-secondary)', fontWeight: 600 }}>
                CURRENT SEGMENT
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--anchor-text-accent)' }}>
                {snapshot.current.item.title} {snapshot.current.item.type ? `(${snapshot.current.item.type})` : ''}
              </div>
            </div>
          )}

          {/* Drift-Free Per-Second Countdown */}
          <Countdown snapshot={snapshot} serverOffset={serverOffset} />
        </div>
      </header>

      {/* Schedule Delay Warning Banner */}
      {isDelayed && (
        <DelayBanner delayOffsetMinutes={snapshot?.delayOffsetMinutes || 0} />
      )}

      {/* Main Teleprompter Script Card */}
      <ScriptCard script={snapshot?.current?.script} />

      {/* Crowd Brain Audience Feedback & AI Insights Card */}
      <CrowdBrainCard
        aggregate={crowdBrainAggregate}
        loading={crowdBrainLoading}
        error={crowdBrainError}
        isRegenerating={isRegenerating}
        regenerateResult={regenerateResult}
        onRegenerateLine={triggerRegenerateLine}
      />

      {/* Footer / Next Up Banner */}
      <NextUpBanner next={snapshot?.next} />
    </div>
  );
}
