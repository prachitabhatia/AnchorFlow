import { useParams } from 'react';

export default function SummaryPage() {
  const { id } = useParams();

  return (
    <div className="organizer-card">
      <h2 className="organizer-page-title">Event Summary & Analytics</h2>
      <p className="organizer-page-desc">
        Post-event performance analytics and timeline logs for Event <code style={{ color: 'var(--organizer-accent)' }}>{id}</code> — coming in Stage 12.
      </p>
    </div>
  );
}
