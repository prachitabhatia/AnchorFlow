import { apiFetch } from './client';

/**
 * Speaker API Module
 * Thin wrappers around apiFetch for speaker operations.
 */

export async function createSpeaker(eventId, { name, role, organization, bio }) {
  return await apiFetch(`/events/${eventId}/speakers`, {
    method: 'POST',
    body: { name, role, organization, bio },
  });
}

export async function listSpeakers(eventId) {
  return await apiFetch(`/events/${eventId}/speakers`);
}

export async function updateSpeaker(id, patch) {
  return await apiFetch(`/speakers/${id}`, {
    method: 'PATCH',
    body: patch,
  });
}

export async function deleteSpeaker(id) {
  return await apiFetch(`/speakers/${id}`, {
    method: 'DELETE',
  });
}
