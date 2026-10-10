// src/core/store/ui-store.ts
import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  /** Preferences popup lives at layout level so closing the drawer never unmounts it. */
  prefsOpen: boolean;
  /** Tenant slug a SuperAdmin is "inside". In memory only: a page reload returns to global view. */
  activeTenantSlug: string | null;
  setSidebarOpen: (open: boolean) => void;
  setPrefsOpen: (open: boolean) => void;
  setActiveTenant: (slug: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  prefsOpen: false,
  activeTenantSlug: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setPrefsOpen: (open) => set({ prefsOpen: open }),
  setActiveTenant: (slug) => set({ activeTenantSlug: slug }),
}));
