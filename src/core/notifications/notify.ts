// src/core/notifications/notify.ts
// THE way to notify the user. Shows the toast AND records it in the history (bell in the status bar).
// Never call sonner's `toast` directly elsewhere, or the notification will be missing from the history.
import { toast } from "sonner";
import { useNotifications, type NotificationType } from "@/core/notifications/notifications-store";

function show(type: NotificationType, message: string) {
  toast[type](message);
  useNotifications.getState().add(type, message);
}

export const notify = {
  success: (message: string) => show("success", message),
  error: (message: string) => show("error", message),
  warning: (message: string) => show("warning", message),
  info: (message: string) => show("info", message),
};
