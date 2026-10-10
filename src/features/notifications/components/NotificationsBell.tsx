// src/features/notifications/components/NotificationsBell.tsx
// Bell with an unread badge, meant for the status bar. Opens the notification history.
import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { UI_CONFIG } from "@/core/config/ui.config";
import { useNotifications } from "@/core/notifications/notifications-store";
import { NotificationsPopup } from "@/features/notifications/components/NotificationsPopup";

export function NotificationsBell() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const unread = useNotifications((s) => s.items.reduce((n, i) => n + (i.read ? 0 : 1), 0));
  const { BADGE_MAX } = UI_CONFIG.NOTIFICATIONS;

  return (
    <>
      <button
        onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={t("notifications.bell", { count: unread })}
        className="relative grid size-7 place-items-center rounded-md transition-transform hover:bg-ink/10 active:scale-90 focus-visible:outline-2 focus-visible:outline-brand-text"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        <AnimatePresence initial={false}>
          {unread > 0 && (
            <m.span
              key={unread}
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-600 px-1 text-center text-[10px] font-semibold leading-4 text-white"
            >
              {unread > BADGE_MAX ? `${BADGE_MAX}+` : unread}
            </m.span>
          )}
        </AnimatePresence>
      </button>
      <NotificationsPopup open={open} onClose={() => setOpen(false)} />
    </>
  );
}
