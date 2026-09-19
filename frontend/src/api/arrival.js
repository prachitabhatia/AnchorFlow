import { apiFetch } from './client';

/**
 * Speaker Arrival API Module
 * Root-level endpoint: POST /speaker-arrived
 * Request body: { speakerId }
 * Returns: { speaker, script, liveState }
 */
export async function speakerArrived(speakerId) {
  return await apiFetch('/speaker-arrived', {
    method: 'POST',
    body: { speakerId },
  });
}
