/**
 * Time Utility Functions
 * Computes server-client time offset for drift-free countdowns.
 */

export function computeServerOffset(serverTimeIso) {
  if (!serverTimeIso) return 0;
  const serverMs = new Date(serverTimeIso).getTime();
  if (isNaN(serverMs)) return 0;
  return serverMs - Date.now();
}

export function correctedNow(offset = 0) {
  return Date.now() + offset;
}
