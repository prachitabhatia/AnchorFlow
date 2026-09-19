import { apiFetch } from './client';

/**
 * Organizer Live Control API Module
 * All functions are organizer-authenticated via header passcode.
 */

export async function goLive(eventId) {
  return await apiFetch(`/events/${eventId}/go-live`, { method: 'POST' });
}

export async function advance(eventId) {
  return await apiFetch(`/events/${eventId}/advance`, { method: 'POST' });
}

export async function pause(eventId) {
  return await apiFetch(`/events/${eventId}/pause`, { method: 'POST' });
}

export async function resume(eventId) {
  return await apiFetch(`/events/${eventId}/resume`, { method: 'POST' });
}

/**
 * End Event API
 * Returns { snapshot, closingScript }
 */
export async function endEvent(eventId) {
  return await apiFetch(`/events/${eventId}/end`, { method: 'POST' });
}
