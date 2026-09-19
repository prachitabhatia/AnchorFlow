import { apiFetch } from './client';

/**
 * Agenda API Module
 * Thin wrappers around apiFetch for agenda operations.
 * NOTE: Request bodies NEVER send offsetMinutes, orderIndex, or status.
 */

export async function createAgendaItem(eventId, { title, type, speakerId, plannedStart, durationMinutes, isBuffer }) {
  return await apiFetch(`/events/${eventId}/agenda`, {
    method: 'POST',
    body: { title, type, speakerId, plannedStart, durationMinutes, isBuffer },
  });
}

export async function listAgendaItems(eventId) {
  return await apiFetch(`/events/${eventId}/agenda`);
}

export async function updateAgendaItem(id, { title, type, speakerId, plannedStart, durationMinutes, isBuffer }) {
  // Only include fields that are defined in patch payload
  const body = {};
  if (title !== undefined) body.title = title;
  if (type !== undefined) body.type = type;
  if (speakerId !== undefined) body.speakerId = speakerId;
  if (plannedStart !== undefined) body.plannedStart = plannedStart;
  if (durationMinutes !== undefined) body.durationMinutes = durationMinutes;
  if (isBuffer !== undefined) body.isBuffer = isBuffer;

  return await apiFetch(`/agenda/${id}`, {
    method: 'PATCH',
    body,
  });
}

export async function reorderAgenda(eventId, orderedIds) {
  return await apiFetch(`/events/${eventId}/agenda/reorder`, {
    method: 'POST',
    body: { orderedIds },
  });
}

export async function deleteAgendaItem(id) {
  return await apiFetch(`/agenda/${id}`, {
    method: 'DELETE',
  });
}
