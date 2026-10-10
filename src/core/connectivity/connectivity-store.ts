// src/core/connectivity/connectivity-store.ts
// "Can this app reach the API?" -- not just "does the device have a network".
// navigator.onLine stays true on Wi-Fi without internet and some browsers skip events, so it is only ONE signal.
// Signals: browser online/offline events, API request results (axios interceptor) and a lightweight probe.
//
// Why a plain "got an HTTP answer" is not enough: in development the browser talks to the LOCAL Vite proxy, which
// keeps answering (with a 500) even when Wi-Fi is off. So for the probe, 5xx counts as a failure.
//
// Cost control: the probe is skipped while real requests are succeeding, only runs with the tab visible, and
// polls fast only while offline (those requests fail locally and cost the server nothing).
import { create } from "zustand";
import { API_BASE_URL, ENDPOINTS } from "@/core/config/api.config";
import { UI_CONFIG } from "@/core/config/ui.config";

const C = UI_CONFIG.CONNECTIVITY;

export const useConnectivity = create<{ online: boolean }>(() => ({ online: navigator.onLine }));

let failures = 0;
let lastOkAt = Date.now();
let timer: ReturnType<typeof setTimeout> | undefined;

function setOnline(online: boolean) {
  if (useConnectivity.getState().online !== online) useConnectivity.setState({ online });
}

/** A real answer from the API (< 500). Also resets the failure count and postpones the next probe. */
export function markReachable() {
  failures = 0;
  lastOkAt = Date.now();
  setOnline(true);
}

/** Network error with no response, or the browser said "offline". Immediate. */
export function markUnreachable() {
  failures = C.FAILURES_BEFORE_OFFLINE;
  setOnline(false);
  schedule();
}

function recordFailure() {
  failures += 1;
  if (failures >= C.FAILURES_BEFORE_OFFLINE) setOnline(false);
}

async function probe() {
  if (!navigator.onLine) return markUnreachable(); // the device itself says there is no network
  const ctrl = new AbortController();
  const abort = setTimeout(() => ctrl.abort(), C.PROBE_TIMEOUT_MS);
  try {
    // Raw fetch (not axios) so a 401 here never touches the session logic.
    const res = await fetch(`${API_BASE_URL}${ENDPOINTS.probe}`, { cache: "no-store", credentials: "include", signal: ctrl.signal });
    if (res.status >= 500) recordFailure();
    else markReachable();
  } catch {
    recordFailure();
  } finally {
    clearTimeout(abort);
  }
}

function schedule(delay?: number) {
  clearTimeout(timer);
  const online = useConnectivity.getState().online;
  timer = setTimeout(tick, delay ?? (online ? C.PROBE_INTERVAL_MS : C.OFFLINE_PROBE_INTERVAL_MS));
}

async function tick() {
  const visible = document.visibilityState === "visible";
  const recentlyOk = useConnectivity.getState().online && Date.now() - lastOkAt < C.PROBE_INTERVAL_MS;
  if (visible && !recentlyOk) {
    await probe();
    // A failure that has not reached the threshold yet is re-checked quickly.
    if (failures > 0 && useConnectivity.getState().online) return schedule(C.RETRY_DELAY_MS);
  }
  schedule();
}

export function initConnectivity() {
  const now = () => { clearTimeout(timer); void tick(); };
  window.addEventListener("offline", markUnreachable);
  window.addEventListener("online", now);
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && now());
  now();
}
