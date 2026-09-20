import { apiFetch } from './client';

/**
 * Template API Module
 * Thin wrappers around apiFetch for template operations.
 */

export async function listTemplates() {
  return await apiFetch('/templates');
}

export async function getTemplate(id) {
  return await apiFetch(`/templates/${id}`);
}

export async function deleteTemplate(id) {
  return await apiFetch(`/templates/${id}`, {
    method: 'DELETE',
  });
}

export async function saveEventAsTemplate(eventId, { name, description }) {
  return await apiFetch(`/events/${eventId}/save-as-template`, {
    method: 'POST',
    body: { name, description },
  });
}

export async function createEventFromTemplate(templateId, { name, date, tone, type }) {
  // Only include fields that are defined
  const body = {};
  if (name !== undefined) body.name = name;
  if (date !== undefined) body.date = date;
  if (tone !== undefined) body.tone = tone;
  if (type !== undefined) body.type = type;

  return await apiFetch(`/templates/${templateId}/create-event`, {
    method: 'POST',
    body,
  });
}
