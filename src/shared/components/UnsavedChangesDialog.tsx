// src/shared/components/UnsavedChangesDialog.tsx
import type { Blocker } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";

/** Confirmation shown when navigation (links, menu, browser back) is blocked by useUnsavedChangesGuard. */
export function UnsavedChangesDialog({ blocker }: { blocker: Blocker }) {
  const { t } = useTranslation();
  const blocked = blocker.state === "blocked";
  return (
    <ConfirmDialog
      open={blocked}
      title={t("common.unsaved.title")} body={t("common.unsaved.body")}
      confirmLabel={t("common.unsaved.confirm")} cancelLabel={t("common.unsaved.keep")}
      onCancel={() => blocker.state === "blocked" && blocker.reset()}
      onConfirm={() => blocker.state === "blocked" && blocker.proceed()}
    />
  );
}
