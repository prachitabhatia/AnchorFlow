import { apiFetch } from './client';

/**
 * Fetch public segment options for an event.
 * Explicitly passes organizer: false so no organizer passcode header is attached.
 */
export async function getSegmentOptions(eventId) {
  return apiFetch(`/events/${eventId}/crowd-brain/segments`, {
    organizer: false,
  });
}

/**
 * Submit public feedback for a segment/agenda item.
 * Explicitly passes organizer: false so no organizer passcode header is attached.
 */
export async function submitFeedback(eventId, { agendaItemId, reaction }) {
  return apiFetch(`/events/${eventId}/crowd-brain/feedback`, {
    method: 'POST',
    organizer: false,
    body: { agendaItemId, reaction },
  });
}

/**
 * Fetch aggregate feedback & AI insights for a specific agenda item.
 * Explicitly passes organizer: false so no organizer passcode header is attached.
 */
export async function getAggregate(eventId, agendaItemId) {
  return apiFetch(`/events/${eventId}/crowd-brain/${agendaItemId}/aggregate`, {
    organizer: false,
  });
}

/**
 * Request regeneration of the suggested stage line for an agenda item.
 * Explicitly passes organizer: false so no organizer passcode header is attached.
 */
export async function regenerateLine(eventId, agendaItemId) {
  return apiFetch(`/events/${eventId}/crowd-brain/${agendaItemId}/regenerate-line`, {
    method: 'POST',
    organizer: false,
  });
}
