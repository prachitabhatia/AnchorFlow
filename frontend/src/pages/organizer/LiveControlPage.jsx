import { useParams } from 'react';

export default function LiveControlPage() {
  const { id } = useParams();

  return (
    <div className="organizer-card">
      <h2 className="organizer-page-title" style={{ color: 'var(--organizer-danger)' }}>
        🔴 Live Stage Control Room
      </h2>
      <p className="organizer-page-desc">
        Real-time stage controls & Socket.IO updates for Event <code style={{ color: 'var(--organizer-accent)' }}>{id}</code> — coming in Stages 9 & 10.
      </p>
    </div>
  );
}
