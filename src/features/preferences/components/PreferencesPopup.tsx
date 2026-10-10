// src/features/preferences/components/PreferencesPopup.tsx
// Render ONCE per shell (AppLayout, LoginPage). Open state lives in ui-store.
import { useTranslation } from "react-i18next";
import { useUiStore } from "@/core/store/ui-store";
import { Popup } from "@/shared/components/ui/Popup";
import { PreferencesPanel } from "@/features/preferences/components/PreferencesPanel";

export function PreferencesPopup() {
  const { t } = useTranslation();
  const open = useUiStore((s) => s.prefsOpen);
  const setOpen = useUiStore((s) => s.setPrefsOpen);
  return (
    <Popup open={open} onClose={() => setOpen(false)} title={t("prefs.title")}>
      <PreferencesPanel />
    </Popup>
  );
}
