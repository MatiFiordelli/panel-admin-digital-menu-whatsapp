// src/core/store/ui-store.ts
import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  /** Tenant slug a SuperAdmin is "inside" (sent as x-tenant-id). Wired up in Phase 2. */
  activeTenantSlug: string | null;
  toggleSidebar: () => void;
  setActiveTenant: (slug: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  activeTenantSlug: null,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveTenant: (slug) => set({ activeTenantSlug: slug }),
}));
