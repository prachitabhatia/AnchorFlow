import { useParams } from 'react';

export default function ScriptsPage() {
  const { id } = useParams();

  return (
    <div className="organizer-card">
      <h2 className="organizer-page-title">AI Teleprompter Script Generator</h2>
      <p className="organizer-page-desc">
        AI-assisted script generator for Event <code style={{ color: 'var(--organizer-accent)' }}>{id}</code> — coming in Stage 7.
      </p>
    </div>
  );
}
