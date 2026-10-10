// src/features/preferences/components/PreferencesButton.tsx
import { useTranslation } from "react-i18next";
import { useUiStore } from "@/core/store/ui-store";

interface Props {
  /** "rail": text row for the sidebar. "plain": icon button (login page, which has no sidebar). */
  variant?: "plain" | "rail";
  /** Called right after opening (the sidebar uses it to close the mobile drawer). */
  onOpen?: () => void;
}

export function PreferencesButton({ variant = "plain", onOpen }: Props) {
  const { t } = useTranslation();
  const setPrefsOpen = useUiStore((s) => s.setPrefsOpen);
  const open = () => { setPrefsOpen(true); onOpen?.(); };

  if (variant === "rail") {
    return (
      <button
        onClick={open} aria-haspopup="dialog"
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-rail-fg/70 transition-colors hover:bg-rail-fg/10 hover:text-rail-fg active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-rail-fg"
      >
        <span aria-hidden>⚙</span>{t("prefs.title")}
      </button>
    );
  }
  return (
    <button
      onClick={open} aria-label={t("prefs.open")} aria-haspopup="dialog"
      className="grid size-9 place-items-center rounded-md border border-ink/25 bg-surface text-lg transition-transform hover:bg-ink/5 active:scale-90 focus-visible:outline-2 focus-visible:outline-brand-text"
    >
      <span aria-hidden>⚙</span>
    </button>
  );
}
