const { DELAY_STRATEGY, AGENDA_STATUS } = require("../constants");

function recalculateSchedule({ items, delayedItemId = null, delayMinutes, strategy, completedItemIds = [], now }) {
  if (!Number.isSafeInteger(delayMinutes) || delayMinutes < 0) throw new RangeError("delayMinutes must be a non-negative integer");
  if (!Object.values(DELAY_STRATEGY).includes(strategy)) throw new RangeError("Unknown delay strategy");
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new TypeError("now must be an injected valid Date");

  const ordered = items.map((item) => ({ ...item })).sort((a, b) => a.orderIndex - b.orderIndex);
  for (const item of ordered) {
    if (!(item.plannedStart instanceof Date) || !Number.isFinite(item.plannedStart.getTime())) throw new TypeError("plannedStart must be a valid Date");
    if (!Number.isSafeInteger(item.durationMinutes) || item.durationMinutes < 0) throw new RangeError("durationMinutes must be a non-negative integer");
  }
  const doneIds = new Set(completedItemIds);
  for (const item of ordered) if (item.status === AGENDA_STATUS.DONE) doneIds.add(item.id);
  const delayedIndex = ordered.findIndex((item) => item.id === delayedItemId);
  if (delayedItemId !== null && delayedIndex === -1) throw new RangeError("Delayed item is not in the agenda");

  const activeDelay = delayedIndex !== -1 && !doneIds.has(delayedItemId) ? delayMinutes : 0;
  const downstream = ordered.slice(delayedIndex + 1).filter((item) => !doneIds.has(item.id));
  const reductions = new Map();
  let remainingDelay = activeDelay;
  let absorbedMinutes = 0;
  let compressedMinutes = 0;

  // Both recovery strategies consume unfinished downstream buffers before shortening sessions.
  if (strategy === DELAY_STRATEGY.ABSORB_VIA_BUFFER || strategy === DELAY_STRATEGY.COMPRESS_NEXT_SESSIONS) {
    for (const item of downstream) {
      if (!item.isBuffer) continue;
      const reduction = Math.min(item.durationMinutes, remainingDelay);
      reductions.set(item.id, reduction);
      remainingDelay -= reduction;
      absorbedMinutes += reduction;
    }
  }

  // Compress sessions only as needed, by at most 15% in whole minutes and never below five.
  if (strategy === DELAY_STRATEGY.COMPRESS_NEXT_SESSIONS) {
    for (const item of downstream) {
      if (item.isBuffer) continue;
      const capacity = Math.min(Math.floor(item.durationMinutes * 15 / 100), Math.max(0, item.durationMinutes - 5));
      const reduction = Math.min(capacity, remainingDelay);
      reductions.set(item.id, reduction);
      remainingDelay -= reduction;
      compressedMinutes += reduction;
    }
  }

  // Filler preserves every duration and carries the entire delay into the remaining schedule.
  if (strategy === DELAY_STRATEGY.INSERT_FILLER_SEGMENT) remainingDelay = activeDelay;

  const currentIndex = ordered.findIndex((item) => !doneIds.has(item.id));
  const currentItemId = ordered[currentIndex]?.id ?? null;
  const nextItemId = currentIndex === -1 ? null : (ordered[currentIndex + 1]?.id ?? null);
  let carriedDelay = 0;
  const resultItems = ordered.map((item, index) => {
    if (index === delayedIndex) carriedDelay = activeDelay;
    const done = doneIds.has(item.id);
    const offsetMinutes = done ? 0 : carriedDelay;
    const reduction = reductions.get(item.id) || 0;
    const durationMinutes = item.durationMinutes - reduction;
    carriedDelay -= reduction;

    // Clone the injected date to return Dates without reading the clock or mutating inputs.
    const effectiveStart = structuredClone(now);
    effectiveStart.setTime(item.plannedStart.getTime() + offsetMinutes * 60000);
    const effectiveEnd = structuredClone(now);
    effectiveEnd.setTime(effectiveStart.getTime() + durationMinutes * 60000);
    let status = AGENDA_STATUS.UPCOMING;
    if (done) status = AGENDA_STATUS.DONE;
    else if (item.id === delayedItemId && activeDelay > 0) status = AGENDA_STATUS.DELAYED;
    else if (item.id === currentItemId) status = AGENDA_STATUS.CURRENT;
    return { id: item.id, offsetMinutes, durationMinutes, effectiveStart, effectiveEnd, status };
  });

  return {
    items: resultItems, currentItemId, nextItemId,
    absorbedMinutes, pushedMinutes: remainingDelay, compressedMinutes, strategyApplied: strategy,
  };
}

module.exports = { recalculateSchedule };
