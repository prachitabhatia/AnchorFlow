const assert = require("node:assert/strict");
const { recalculateSchedule } = require("../src/services/scheduleEngine");
const { DELAY_STRATEGY, AGENDA_STATUS } = require("../src/constants");

const now = new Date("2026-09-19T10:00:00.000Z");
function agenda(durations, bufferIndexes = []) {
  let start = now.getTime();
  return durations.map((durationMinutes, orderIndex) => {
    const item = {
      id: `item-${orderIndex}`, plannedStart: new Date(start), durationMinutes,
      offsetMinutes: 0, orderIndex, isBuffer: bufferIndexes.includes(orderIndex), status: AGENDA_STATUS.UPCOMING,
    };
    start += durationMinutes * 60000;
    return item;
  });
}
function run(items, options = {}) {
  return recalculateSchedule({
    items, delayedItemId: items[0]?.id ?? null, delayMinutes: 20,
    strategy: DELAY_STRATEGY.ABSORB_VIA_BUFFER, completedItemIds: [], now, ...options,
  });
}
function checkTimes(result, original) {
  for (const item of result.items) {
    const planned = original.find((entry) => entry.id === item.id);
    assert.equal(item.effectiveStart.getTime(), planned.plannedStart.getTime() + item.offsetMinutes * 60000);
    assert.equal(item.effectiveEnd.getTime(), item.effectiveStart.getTime() + item.durationMinutes * 60000);
    assert(item.durationMinutes >= 0);
    assert(Number.isInteger(item.durationMinutes));
    assert(item.effectiveEnd >= item.effectiveStart);
  }
}

// 1. The buffer starts late, shrinks to zero, then reduces the offset of later items.
const buffered = agenda([30, 10, 30], [1]);
const absorbed = run(buffered);
assert.deepEqual(absorbed.items.map((item) => item.offsetMinutes), [20, 20, 10]);
assert.deepEqual(absorbed.items.map((item) => item.durationMinutes), [30, 0, 30]);
assert.equal(absorbed.absorbedMinutes, 10);
assert.equal(absorbed.pushedMinutes, 10);
assert.equal(absorbed.compressedMinutes, 0);
assert.equal(absorbed.currentItemId, "item-0");
assert.equal(absorbed.nextItemId, "item-1");
assert.equal(absorbed.items[0].status, "delayed");
checkTimes(absorbed, buffered);
assert.equal(absorbed.items[0].effectiveEnd.getTime(), absorbed.items[1].effectiveStart.getTime());
assert.equal(absorbed.items[1].effectiveEnd.getTime(), absorbed.items[2].effectiveStart.getTime());

// 2. Delay exceeds multiple buffers: only the residual delay reaches the last item.
const multiple = run(agenda([30, 4, 10, 6, 20], [1, 3]), { delayMinutes: 35 });
assert.equal(multiple.absorbedMinutes, 10);
assert.equal(multiple.pushedMinutes, 25);
assert.deepEqual(multiple.items.map((item) => item.offsetMinutes), [35, 35, 31, 31, 25]);

// 3. Last-item delay shifts that item only; there is no downstream recovery capacity.
const last = run(buffered, { delayedItemId: "item-2", completedItemIds: ["item-0", "item-1"] });
assert.equal(last.currentItemId, "item-2");
assert.equal(last.nextItemId, null);
assert.equal(last.absorbedMinutes, 0);
assert.equal(last.pushedMinutes, 20);
assert.deepEqual(last.items.map((item) => item.offsetMinutes), [0, 0, 20]);

// 4. Completed-item delays are ignored; done always wins over delayed/current.
const completed = run(buffered, { completedItemIds: ["item-0"] });
assert.equal(completed.items[0].status, "done");
assert.equal(completed.items[1].status, "current");
assert.equal(completed.currentItemId, "item-1");
assert.equal(completed.nextItemId, "item-2");
assert.equal(completed.pushedMinutes, 0);
assert.deepEqual(completed.items.map((item) => item.durationMinutes), [30, 10, 30]);

// 5. An empty agenda has no current/next item and cannot carry a delay.
assert.deepEqual(run([]), {
  items: [], currentItemId: null, nextItemId: null, absorbedMinutes: 0,
  pushedMinutes: 0, compressedMinutes: 0, strategyApplied: DELAY_STRATEGY.ABSORB_VIA_BUFFER,
});

// 6. Whole-minute 15% caps; five-minute and already shorter sessions stay unchanged.
const compressInput = agenda([30, 10, 20, 6, 5, 4, 7], [1]);
const compressed = run(compressInput, { delayMinutes: 30, strategy: DELAY_STRATEGY.COMPRESS_NEXT_SESSIONS });
assert.equal(compressed.absorbedMinutes, 10);
assert.equal(compressed.compressedMinutes, 4);
assert.equal(compressed.pushedMinutes, 16);
assert.deepEqual(compressed.items.map((item) => item.durationMinutes), [30, 0, 17, 6, 5, 4, 6]);
for (let i = 2; i < compressInput.length; i++) {
  assert(compressInput[i].durationMinutes - compressed.items[i].durationMinutes <= compressInput[i].durationMinutes * 0.15);
  assert(compressed.items[i].durationMinutes >= Math.min(5, compressInput[i].durationMinutes));
}
checkTimes(compressed, compressInput);

// 7-8. Repeated calls are identical, and frozen input objects and Dates are unchanged.
const frozen = agenda([30, 10, 20], [1]);
const original = structuredClone(frozen);
for (const item of frozen) { Object.freeze(item.plannedStart); Object.freeze(item); }
Object.freeze(frozen);
const first = run(frozen);
assert.deepEqual(run(frozen), first);
assert.deepEqual(frozen, original);
first.items[0].effectiveStart.setTime(0);
assert.deepEqual(frozen, original);
assert.equal(now.toISOString(), "2026-09-19T10:00:00.000Z");

// Additional boundaries: zero delay resets old offsets; no double-offset arithmetic.
const offsetInput = agenda([10, 10]);
offsetInput[0].offsetMinutes = 100;
offsetInput[1].offsetMinutes = -5;
const zero = run(offsetInput, { delayMinutes: 0 });
assert.deepEqual(zero.items.map((item) => item.offsetMinutes), [0, 0]);
assert.deepEqual(zero.items.map((item) => item.status), ["current", "upcoming"]);
const filler = run(offsetInput, { strategy: DELAY_STRATEGY.INSERT_FILLER_SEGMENT });
assert.deepEqual(filler.items.map((item) => item.offsetMinutes), [20, 20]);
checkTimes(filler, offsetInput);
const fillerBuffer = run(buffered, { strategy: DELAY_STRATEGY.INSERT_FILLER_SEGMENT });
assert.deepEqual(fillerBuffer.items.map((item) => item.durationMinutes), [30, 10, 30]);
assert.equal(fillerBuffer.absorbedMinutes, 0);

// Buffers get priority even when a compressible session comes before them.
const priority = run(agenda([20, 40, 10, 20], [2]), { delayMinutes: 5, strategy: DELAY_STRATEGY.COMPRESS_NEXT_SESSIONS });
assert.equal(priority.compressedMinutes, 0);
assert.equal(priority.pushedMinutes, 0);
assert.deepEqual(priority.items.map((item) => item.offsetMinutes), [5, 5, 5, 0]);
assert.deepEqual(priority.items.map((item) => item.durationMinutes), [20, 40, 5, 20]);

// Earlier and completed buffers cannot absorb delay; order follows orderIndex.
const mixed = agenda([10, 20, 10, 30], [0, 2]);
mixed[2].status = AGENDA_STATUS.DONE;
const skipped = run([...mixed].reverse(), { delayedItemId: "item-1", completedItemIds: ["item-0"] });
assert.deepEqual(skipped.items.map((item) => item.id), ["item-0", "item-1", "item-2", "item-3"]);
assert.equal(skipped.absorbedMinutes, 0);
assert.equal(skipped.items[2].status, "done");
assert.equal(skipped.items[2].durationMinutes, 10);
const allDone = run(buffered, { completedItemIds: buffered.map((item) => item.id) });
assert.equal(allDone.currentItemId, null);
assert.equal(allDone.nextItemId, null);
assert.equal(allDone.pushedMinutes, 0);
assert.equal(run(buffered, { delayedItemId: null }).pushedMinutes, 0);
assert.throws(() => run(buffered, { delayMinutes: -1 }), /non-negative integer/);
assert.throws(() => run(buffered, { delayMinutes: 1.5 }), /non-negative integer/);
assert.throws(() => run(buffered, { strategy: "unknown" }), /Unknown delay strategy/);

console.log("all schedule tests passed");
