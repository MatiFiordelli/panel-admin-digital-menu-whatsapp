// src/core/notifications/notifications-store.ts
// History of every notification shown as a toast. Persisted in localStorage ("admin-notifications").
// Do not put sensitive data in notification messages: the history survives logout on this browser.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UI_CONFIG } from "@/core/config/ui.config";

export type NotificationType = "success" | "error" | "warning" | "info";
export const NOTIFICATION_TYPES: NotificationType[] = ["success", "error", "warning", "info"];

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string; // already translated at the time it was shown
  at: number;      // ms since epoch
  read: boolean;
}

interface State {
  items: NotificationItem[]; // newest first
  add: (type: NotificationType, message: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  markAllRead: () => void;
}

export const useNotifications = create<State>()(
  persist(
    (set) => ({
      items: [],
      add: (type, message) =>
        set((s) => ({
          items: [{ id: crypto.randomUUID(), type, message, at: Date.now(), read: false }, ...s.items].slice(
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
