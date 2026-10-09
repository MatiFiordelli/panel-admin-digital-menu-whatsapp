// src/pages/DashboardPage.tsx
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">{t("dashboard.welcome", { email: user?.email })}</h1>
      <p className="mt-1 text-sm text-ink/70">{t("dashboard.role", { role: user?.role })}</p>
      <p className="mt-6 text-sm">{t("dashboard.next")}</p>
    </section>
  );
}
