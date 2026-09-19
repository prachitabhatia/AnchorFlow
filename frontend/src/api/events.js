import { apiFetch } from './client';

/**
 * Event API Module
 * Thin wrappers around apiFetch for event operations.
 */

export async function createEvent({ name, type, tone, date }) {
  return await apiFetch('/events', {
    method: 'POST',
    body: { name, type, tone, date },
  });
}

export async function listEvents() {
  return await apiFetch('/events');
}

export async function getEvent(id) {
  return await apiFetch(`/events/${id}`);
}

export async function updateEvent(id, patch) {
  return await apiFetch(`/events/${id}`, {
    method: 'PATCH',
    body: patch,
  });
}

export async function deleteEvent(id) {
  return await apiFetch(`/events/${id}`, {
    method: 'DELETE',
  });
}
