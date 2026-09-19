import { apiFetch } from './client';

/**
 * Report Delay API Module
 * Root-level endpoint: POST /report-delay
 * Request body: { agendaItemId, delayMinutes }
 * Returns: { liveState, script, strategy, announcement }
 */
export async function reportDelay({ agendaItemId, delayMinutes }) {
  return await apiFetch('/report-delay', {
    method: 'POST',
    body: {
      agendaItemId,
      delayMinutes: Number(delayMinutes),
    },
  });
}
