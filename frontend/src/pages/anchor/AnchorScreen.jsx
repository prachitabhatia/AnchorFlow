import { useParams } from 'react';
import '../../styles/anchor.css';

export default function AnchorScreen() {
  const { eventId } = useParams();

  return (
    <div className="anchor-screen">
      <div className="anchor-stage-card">
        <div className="anchor-badge">
          <span className="anchor-live-dot" />
          Public Stage Teleprompter
        </div>

        <h1 className="anchor-title">
          Anchor screen — Stage 8 will make this live
        </h1>

        <p className="anchor-subtitle">
          High-visibility teleprompter & cue screen for stage anchors and presenters.
        </p>

        <div>
          Target Event: <span className="anchor-event-id">{eventId || 'No Event ID Specified'}</span>
        </div>
      </div>
    </div>
  );
}
