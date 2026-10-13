// src/core/notifications/notifications-store.ts
// History of every notification shown as a toast. Persisted in localStorage ("admin-notifications").
// Items keep a translation KEY + params (not the translated text), so the history always shows the CURRENT language.
// Older items saved before this change only have `message` and are shown as-is.
// Do not put sensitive data in params: the history survives logout on this browser.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UI_CONFIG } from "@/core/config/ui.config";
import type { NotifyParams } from "@/core/notifications/params";

export type NotificationType = "success" | "error" | "warning" | "info";
export const NOTIFICATION_TYPES: NotificationType[] = ["success", "error", "warning", "info"];

export interface NotificationItem {
  id: string;
  type: NotificationType;
  key?: string;            // translation key
  params?: NotifyParams;   // values for the key
  message?: string;        // legacy items only (already translated text)
  at: number;              // ms since epoch
  read: boolean;
}

interface State {
  items: NotificationItem[]; // newest first
  add: (type: NotificationType, key: string, params?: NotifyParams) => void;
  remove: (id: string) => void;
  clear: () => void;
  markAllRead: () => void;
}

export const useNotifications = create<State>()(
  persist(
    (set) => ({
      items: [],
      add: (type, key, params) =>
        set((s) => ({
          items: [{ id: crypto.randomUUID(), type, key, params, at: Date.now(), read: false }, ...s.items].slice(
            0,
            UI_CONFIG.NOTIFICATIONS.MAX_STORED,
          ),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      // Returns the same state when nothing is unread, so subscribers do not re-render.
      markAllRead: () => set((s) => (s.items.some((i) => !i.read) ? { items: s.items.map((i) => ({ ...i, read: true })) } : s)),
    }),
    { name: "admin-notifications", partialize: (s) => ({ items: s.items }) },
  ),
);
