import React from 'react';

/**
 * StatusBadge Component
 * Renders runState (live/paused/ended/not_started) and scheduleStatus (on_time/delayed)
 * as two separate, visually distinct pills.
 */
export default function StatusBadge({ runState, scheduleStatus }) {
  // Config for runState pill
  const getRunStateConfig = (state) => {
    switch (state) {
      case 'live':
        return {
          label: '🔴 LIVE',
          bg: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.4)',
        };
      case 'paused':
        return {
          label: '⏸️ PAUSED',
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#f59e0b',
          border: '1px solid rgba(245, 158, 11, 0.4)',
        };
      case 'ended':
        return {
          label: '🏁 ENDED',
          bg: 'rgba(148, 163, 184, 0.15)',
          color: '#94a3b8',
          border: '1px solid rgba(148, 163, 184, 0.4)',
        };
      default:
        return {
          label: '⚪ NOT LIVE YET',
          bg: 'rgba(56, 189, 248, 0.15)',
          color: '#38bdf8',
          border: '1px solid rgba(56, 189, 248, 0.4)',
        };
    }
  };

  // Config for scheduleStatus pill
  const getScheduleConfig = (status) => {
    switch (status) {
      case 'delayed':
        return {
          label: '⚠️ DELAYED',
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#f59e0b',
          border: '1px solid rgba(245, 158, 11, 0.4)',
        };
      case 'on_time':
        return {
          label: '⏱️ ON TIME',
          bg: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.4)',
        };
      default:
        return {
          label: '⏱️ SCHEDULE READY',
          bg: 'rgba(100, 116, 139, 0.15)',
          color: '#94a3b8',
          border: '1px solid rgba(100, 116, 139, 0.3)',
        };
    }
  };

  const runCfg = getRunStateConfig(runState);
  const schedCfg = getScheduleConfig(scheduleStatus);

  const pillBaseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.3rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
      {/* Pill 1: Run State */}
      <span
        style={{
          ...pillBaseStyle,
          backgroundColor: runCfg.bg,
          color: runCfg.color,
          border: runCfg.border,
        }}
      >
        {runCfg.label}
      </span>

      {/* Pill 2: Schedule Status (never merged with Run State) */}
      <span
        style={{
          ...pillBaseStyle,
          backgroundColor: schedCfg.bg,
          color: schedCfg.color,
          border: schedCfg.border,
        }}
      >
        {schedCfg.label}
      </span>
    </div>
  );
}
