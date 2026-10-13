// src/core/notifications/notify.ts
// THE way to notify the user: notify.success("some.translation.key", { params }).
// Shows the toast (translated now) AND records the key + params in the history (translated when displayed).
// Never call sonner's `toast` directly elsewhere, and never pass already-translated text.
import type { TFunction } from "i18next";
import { toast } from "sonner";
import i18n from "@/core/i18n";
import { useNotifications, type NotificationType } from "@/core/notifications/notifications-store";
import { resolveParams, type NotifyParams } from "@/core/notifications/params";

function show(type: NotificationType, key: string, params?: NotifyParams) {
  const t = i18n.t.bind(i18n) as TFunction;
  toast[type](t(key, resolveParams(params, t)) as string);
  useNotifications.getState().add(type, key, params);
}

export const notify = {
  success: (key: string, params?: NotifyParams) => show("success", key, params),
  error: (key: string, params?: NotifyParams) => show("error", key, params),
  warning: (key: string, params?: NotifyParams) => show("warning", key, params),
  info: (key: string, params?: NotifyParams) => show("info", key, params),
};
