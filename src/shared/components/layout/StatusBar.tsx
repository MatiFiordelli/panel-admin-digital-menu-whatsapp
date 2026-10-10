// src/shared/components/layout/StatusBar.tsx
// Browser-style footer: connection state, time of the last successful refresh from the API, and the
// notifications bell. Phase 3 adds a slot here for "N changes pending sync" (IndexedDB drafts).
import { useEffect, useRef } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { notify } from "@/core/notifications/notify";
import { NotificationsBell } from "@/features/notifications/components/NotificationsBell";
import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";
import { useLastSync } from "@/shared/hooks/useLastSync";

export function StatusBar() {
  const { t, i18n } = useTranslation();
  const online = useOnlineStatus();
  const lastSync = useLastSync();
  const fetching = useIsFetching({ predicate: (q) => q.queryKey[0] !== "auth" }) > 0;

  // Notify only on a real change (comparing with the previous value also survives StrictMode double effects).
  const prev = useRef(online);
  useEffect(() => {
    if (prev.current === online) return;
    prev.current = online;
    if (online) notify.success(t("status.backOnline"));
    else notify.error(t("status.lostConnection"));
  }, [online, t]);

  const fmt = new Intl.DateTimeFormat(i18n.language, { timeStyle: "medium" });

  return (
    <footer className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-ink/15 bg-surface px-4 py-1 text-xs text-ink/70">
      <span role="status" className="flex items-center gap-1.5">
        <span aria-hidden className={`size-2 rounded-full ${online ? "bg-green-500" : "bg-danger"}`} />
        {online ? t("status.online") : t("status.offline")}
      </span>
      <span className="flex items-center gap-2">
        {fetching && <span aria-hidden className="size-3 animate-spin rounded-full border-2 border-ink/20 border-t-brand-text" />}
        <span>{fetching ? t("status.syncing") : lastSync ? t("status.updated", { time: fmt.format(lastSync) }) : t("status.noData")}</span>
        <NotificationsBell />
      </span>
    </footer>
  );
}
