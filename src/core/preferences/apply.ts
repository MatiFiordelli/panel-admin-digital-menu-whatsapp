// src/core/preferences/apply.ts
// Applies preferences to <html>: .dark class, data-theme (palette) and data-motion.
// The inline script in index.html does the same before first paint; this keeps it in sync afterwards.
import { DEFAULT_PALETTE, PALETTES, usePreferences, type Mode } from "@/core/preferences/preferences-store";

const media = window.matchMedia("(prefers-color-scheme: dark)");

function resolveDark(mode: Mode): boolean {
  return mode === "dark" || (mode === "system" && media.matches);
}

export function applyPreferences() {
  const { mode, palette, animations } = usePreferences.getState();
  const root = document.documentElement;
  root.classList.toggle("dark", resolveDark(mode));
  // Unknown id (e.g. a palette that was removed from the CSS) falls back to the default.
  root.dataset.theme = PALETTES.some((p) => p.id === palette) ? palette : DEFAULT_PALETTE;
  root.dataset.motion = animations ? "on" : "off";
}

export function initPreferences() {
  applyPreferences();
  usePreferences.subscribe(applyPreferences);
  media.addEventListener("change", applyPreferences); // "system" mode follows the OS live
}
