// src/core/preferences/preferences-store.ts
// UI preferences, persisted in localStorage under "admin-prefs". Never holds auth state.
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Mode = "light" | "dark" | "system";
export const MODES: Mode[] = ["light", "dark", "system"];

/** Add/remove a palette here AND in src/styles/themes.css. `swatch` is only for the picker. */
export const PALETTES = [
  { id: "emerald", swatch: "#0f6b57" },
  { id: "indigo", swatch: "#4338ca" },
  { id: "rose", swatch: "#be123c" },
  { id: "amber", swatch: "#b45309" },
] as const;
export const DEFAULT_PALETTE: string = PALETTES[0].id;

interface PreferencesState {
  mode: Mode;
  palette: string;
  animations: boolean;
  setMode: (m: Mode) => void;
  setPalette: (p: string) => void;
  setAnimations: (on: boolean) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      mode: "system",
      palette: DEFAULT_PALETTE,
      animations: true,
      setMode: (mode) => set({ mode }),
      setPalette: (palette) => set({ palette }),
      setAnimations: (animations) => set({ animations }),
    }),
    {
      name: "admin-prefs",
      partialize: (s) => ({ mode: s.mode, palette: s.palette, animations: s.animations }),
    },
  ),
);
