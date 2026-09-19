import { apiFetch } from './client';

/**
 * Public Live API Module
 * Fetches public live snapshot without sending organizer passcode.
 */
export async function getLiveSnapshot(eventId) {
  // MUST pass organizer: false so x-organizer-passcode header is omitted
  return await apiFetch(`/live/${eventId}`, { organizer: false });
}
