const EVENT_STATUS = Object.freeze({
  DRAFT: "draft",
  LIVE: "live",
  PAUSED: "paused",
  ENDED: "ended",
});

const EVENT_TONE = Object.freeze({
  FORMAL: "formal",
  CASUAL: "casual",
  ENERGETIC: "energetic",
});

const ARRIVAL_STATUS = Object.freeze({
  NOT_ARRIVED: "not_arrived",
  ARRIVED: "arrived",
  ON_STAGE: "on_stage",
  DONE: "done",
});

const AGENDA_STATUS = Object.freeze({
  UPCOMING: "upcoming",
  CURRENT: "current",
  DELAYED: "delayed",
  DONE: "done",
});

const SCRIPT_TYPE = Object.freeze({
  OPENING: "opening",
  INTRO: "intro",
  ACTIVITY_INTRO: "activity_intro",
  TRANSITION: "transition",
  FILLER: "filler",
  ANNOUNCEMENT: "announcement",
  CLOSING: "closing",
});

const SCRIPT_VARIANT = Object.freeze({
  LIVE: "live",
  CACHED: "cached",
});

const RUN_STATE = Object.freeze({
  LIVE: "live",
  PAUSED: "paused",
  ENDED: "ended",
});

const SCHEDULE_STATUS = Object.freeze({
  ON_TIME: "on_time",
  DELAYED: "delayed",
});

const ANNOUNCEMENT_SOURCE = Object.freeze({
  ORGANIZER_DELAY: "organizer_delay",
  ORGANIZER_MANUAL: "organizer_manual",
  VIBE_METER: "vibe_meter",
});

const DELAY_STRATEGY = Object.freeze({
  ABSORB_VIA_BUFFER: "absorb_via_buffer",
  COMPRESS_NEXT_SESSIONS: "compress_next_sessions",
  INSERT_FILLER_SEGMENT: "insert_filler_segment",
});

module.exports = {
  EVENT_STATUS,
  EVENT_TONE,
  ARRIVAL_STATUS,
  AGENDA_STATUS,
  SCRIPT_TYPE,
  SCRIPT_VARIANT,
  RUN_STATE,
  SCHEDULE_STATUS,
  ANNOUNCEMENT_SOURCE,
  DELAY_STRATEGY,
};
