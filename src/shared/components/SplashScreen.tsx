// src/shared/components/SplashScreen.tsx
// Neutral screen shown while the session is being checked, so a logged-in user never sees the login form flash.
import { useTranslation } from "react-i18next";

export function SplashScreen() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("common.loading")} className="grid min-h-dvh place-items-center bg-paper">
      <span aria-hidden className="size-6 animate-spin rounded-full border-2 border-ink/20 border-t-brand-text" />
    </div>
  );
}
