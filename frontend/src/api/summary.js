import { apiFetch } from './client';

/**
 * Event Summary API Module
 * GET /events/:id/summary
 * Returns analytics & stage metrics summary object.
 */
export async function getSummary(eventId) {
  return await apiFetch(`/events/${eventId}/summary`);
}
