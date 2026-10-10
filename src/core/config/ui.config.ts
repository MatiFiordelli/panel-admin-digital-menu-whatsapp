// src/core/config/ui.config.ts
// Central place for UI tuning knobs: gesture thresholds, notification limits, connectivity probing.
// Distances are in px, velocities in px/s. Change a number here and the whole app follows.
export const UI_CONFIG = {
  GESTURES: {
    DRAWER: {
      WIDTH: 224,          // menu panel width
      CLOSE_DISTANCE: 80,  // dragged this far left (on the menu or anywhere outside it) -> closes
      CLOSE_VELOCITY: 500, // ...or a left flick faster than this
      OPEN_DISTANCE: 60,   // swipe right from the left edge this far -> opens (the menu follows the finger)
      OPEN_VELOCITY: 400,  // ...or a right flick faster than this (needs OPEN_FLICK_MIN of travel)
      OPEN_FLICK_MIN: 20,
      EDGE_WIDTH: 20,      // touch must START within this many px of the left edge. Browsers reserve
                           // roughly the first 20px for their own "back" gesture, so avoid going lower.
    },
    POPUP: {
      CLOSE_DISTANCE: 100, // header dragged down this far -> closes (mobile bottom sheet)
      CLOSE_VELOCITY: 500,
    },
  },
  NOTIFICATIONS: {
    MAX_STORED: 100,       // oldest are dropped beyond this
    BADGE_MAX: 99,         // badge shows "99+" above this
    LIST_MIN_HEIGHT: "18rem", // keeps the popup from jumping when the filter changes
  },
  CONNECTIVITY: {
    PROBE_INTERVAL_MS: 30_000,        // idle tab, online: ping the API at most this often (skipped if any request succeeded recently)
    OFFLINE_PROBE_INTERVAL_MS: 5_000, // while offline: check often (failing requests cost nothing) to recover quickly
    RETRY_DELAY_MS: 4_000,            // after a failed probe: confirm quickly before declaring offline
    PROBE_TIMEOUT_MS: 8_000,          // a probe slower than this counts as a failure
    FAILURES_BEFORE_OFFLINE: 2,       // consecutive failures before showing "offline" (avoids flapping)
  },
} as const;
