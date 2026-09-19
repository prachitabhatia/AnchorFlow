import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSummary } from '../../api/summary';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorBanner from '../../components/shared/ErrorBanner';

function formatDuration(totalMinutes) {
  if (totalMinutes === null || totalMinutes === undefined || isNaN(totalMinutes)) return '0m';
  const mins = Math.round(totalMinutes);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

export default function SummaryPage() {
  const { id: eventId } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    let isMounted = true;
    setLoading(true);
    setErrorMsg(null);

    getSummary(eventId)
      .then((data) => {
        if (isMounted) setSummary(data);
      })
      .catch((err) => {
        if (isMounted) setErrorMsg(err.message || 'Failed to load event summary metrics.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  if (loading) {
    return (
      <div className="organizer-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
        <LoadingSpinner label="Fetching event performance analytics & metrics..." />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ textAlign: 'left' }}>
        <div className="organizer-card" style={{ marginBottom: '1.5rem' }}>
          <h2 className="organizer-page-title">📊 Event Summary & Analytics</h2>
          <p className="organizer-page-desc" style={{ margin: 0 }}>
            Post-event performance analytics and timeline logs for Event <code style={{ color: 'var(--organizer-accent)' }}>{eventId}</code>.
          </p>
        </div>
        <ErrorBanner message={errorMsg} />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="organizer-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
          No summary metrics available
        </h3>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Agenda Items',
      value: summary.itemsTotal ?? 0,
      icon: '📋',
      color: 'var(--organizer-accent)',
    },
    {
      label: 'Items Completed',
      value: summary.itemsCompleted ?? 0,
      icon: '✅',
      color: 'var(--organizer-success)',
    },
    {
      label: 'On-Time Performance',
      value: `${summary.onTimePercent ?? 0}%`,
      icon: '🎯',
      color: (summary.onTimePercent ?? 0) >= 80 ? 'var(--organizer-success)' : 'var(--organizer-warning)',
    },
    {
      label: 'Delays Handled',
      value: `${summary.delaysHandled ?? 0} ${summary.delaysHandled === 1 ? 'delay' : 'delays'}`,
      icon: '⏱️',
      color: 'var(--organizer-warning)',
    },
    {
      label: 'Total Delay Accumulated',
      value: `${summary.totalDelayMinutes ?? 0} min`,
      icon: '⚠️',
      color: (summary.totalDelayMinutes ?? 0) > 0 ? 'var(--organizer-warning)' : 'var(--organizer-text-secondary)',
    },
    {
      label: 'Scripts Generated',
      value: summary.scriptsGenerated ?? 0,
      icon: '📜',
      color: '#38bdf8',
    },
    {
      label: 'Planned Duration',
      value: formatDuration(summary.plannedDurationMinutes),
      icon: '🗓️',
      color: 'var(--organizer-text)',
    },
    {
      label: 'Actual Duration',
      value: formatDuration(summary.actualDurationMinutes),
      icon: '⌛',
      color: 'var(--organizer-text)',
    },
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      {/* Header */}
      <div className="organizer-card" style={{ marginBottom: '1.5rem' }}>
        <h2 className="organizer-page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📊 Event Summary & Analytics
        </h2>
        <p className="organizer-page-desc" style={{ margin: 0 }}>
          Post-event performance analytics and timeline logs for Event <code style={{ color: 'var(--organizer-accent)' }}>{eventId}</code>.
        </p>
      </div>

      {/* 8 Stat Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="organizer-card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              gap: '0.75rem',
              border: '1px solid var(--organizer-border)',
              backgroundColor: 'var(--organizer-surface)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--organizer-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {card.label}
              </span>
              <span style={{ fontSize: '1.25rem' }}>{card.icon}</span>
            </div>

            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                color: card.color,
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-family-mono)',
              }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
