import { apiFetch } from './client';

/**
 * Script API Module
 * Thin wrappers around apiFetch for script operations.
 */

export async function generateScript({ eventId, type, agendaItemId, extra = {} }) {
  const body = { eventId, type, extra };
  if (agendaItemId) {
    body.agendaItemId = agendaItemId;
  }
  return await apiFetch('/generate-script', {
    method: 'POST',
    body,
  });
}

export async function listScripts(eventId, { type, agendaItemId } = {}) {
  const queryParams = new URLSearchParams();
  if (type) queryParams.append('type', type);
  if (agendaItemId) queryParams.append('agendaItemId', agendaItemId);

  const queryString = queryParams.toString();
  const path = `/events/${eventId}/scripts${queryString ? `?${queryString}` : ''}`;

  return await apiFetch(path);
}

export async function updateScript(id, content) {
  // CRITICAL CONSTRAINT: Body MUST be EXACTLY { content } with no other fields
  const body = { content };
  return await apiFetch(`/scripts/${id}`, {
    method: 'PATCH',
    body,
  });
}

export async function generateAllScripts(eventId) {
  return await apiFetch(`/events/${eventId}/generate-all-scripts`, {
    method: 'POST',
  });
}

export async function pregenerateContingency(eventId) {
  return await apiFetch(`/events/${eventId}/pregenerate-contingency`, {
    method: 'POST',
  });
}
