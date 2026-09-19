import { apiFetch } from './client';

/**
 * Announcement API Module
 * POST /events/:id/announcements -> { announcement, script, liveState }
 * GET /events/:id/announcements  -> Array of announcements (newest first)
 */

export async function createAnnouncement(eventId, message) {
  return await apiFetch(`/events/${eventId}/announcements`, {
    method: 'POST',
    body: { message },
  });
}

export async function listAnnouncements(eventId) {
  return await apiFetch(`/events/${eventId}/announcements`);
}
