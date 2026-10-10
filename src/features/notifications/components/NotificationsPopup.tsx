// src/features/notifications/components/NotificationsPopup.tsx
import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { UI_CONFIG } from "@/core/config/ui.config";
import { Popup } from "@/shared/components/ui/Popup";
import { NOTIFICATION_TYPES, useNotifications, type NotificationType } from "@/core/notifications/notifications-store";

const STYLES: Record<NotificationType, string> = {
  success: "border-green-500 bg-green-500/10",
  error: "border-red-500 bg-red-500/10",
  warning: "border-yellow-500 bg-yellow-500/10",
  info: "border-sky-500 bg-sky-500/10",
};
const chip =
  "block cursor-pointer rounded-full border border-ink/25 px-3 py-1 text-xs font-medium transition-colors active:scale-95 peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-brand-text";

export function NotificationsPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const { items, remove, clear, markAllRead } = useNotifications();
  const [filter, setFilter] = useState<"all" | NotificationType>("all");

  // Opening the history marks everything as read (also covers items that arrive while it is open).
  useEffect(() => {
    if (open) markAllRead();
  }, [open, items.length, markAllRead]);

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: "short", timeStyle: "medium" });
  const visible = filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <Popup open={open} onClose={onClose} title={t("notifications.title")}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <fieldset className="flex flex-wrap gap-1.5">
          <legend className="sr-only">{t("notifications.filter")}</legend>
          {(["all", ...NOTIFICATION_TYPES] as const).map((f) => (
            <label key={f}>
              <input type="radio" name="notif-filter" className="peer sr-only" checked={filter === f} onChange={() => setFilter(f)} />
              <span className={chip}>{t(`notifications.types.${f}`)}</span>
            </label>
          ))}
        </fieldset>
        <button
          onClick={clear} disabled={items.length === 0}
          className="rounded-md border border-ink/25 px-3 py-1 text-xs font-medium transition-colors hover:bg-ink/5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-brand-text"
        >
          {t("notifications.clearAll")}
        </button>
      </div>

      <div style={{ minHeight: UI_CONFIG.NOTIFICATIONS.LIST_MIN_HEIGHT }}>
      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink/60">{t("notifications.empty")}</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {visible.map((n) => (
              <m.li
                key={n.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.15 }}
                className={`flex items-start justify-between gap-3 rounded-md border-l-4 px-3 py-2 ${STYLES[n.type]}`}
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/60">
                    {t(`notifications.types.${n.type}`)} · {fmt.format(n.at)}
                  </div>
                  <div className="break-words text-sm">{n.message}</div>
                </div>
                <button
                  onClick={() => remove(n.id)} aria-label={t("notifications.remove")}
                  className="grid size-6 shrink-0 place-items-center rounded text-base leading-none transition-transform hover:bg-ink/10 active:scale-90 focus-visible:outline-2 focus-visible:outline-brand-text"
                >×</button>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
      </div>
    </Popup>
  );
}
