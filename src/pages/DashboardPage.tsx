// src/pages/DashboardPage.tsx
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUiStore } from "@/core/store/ui-store";

export default function DashboardPage() {
  const { t } = useTranslation();
  useDocumentTitle(t("nav.dashboard"));
  const { user, isSuperAdmin } = useAuth();
  const activeTenantSlug = useUiStore((s) => s.activeTenantSlug);
  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">{t("dashboard.welcome", { email: user?.email })}</h1>
      <p className="mt-1 text-sm text-ink/70">{t("dashboard.role", { role: user?.role })}</p>
      {isSuperAdmin && (
        <p className="mt-5 rounded-md border border-brand/30 bg-brand/5 px-3 py-2 text-sm">
          {activeTenantSlug ? t("dashboard.insideTenant", { slug: activeTenantSlug }) : t("dashboard.pickTenant")}
        </p>
      )}
      <p className="mt-4 text-sm">{t("dashboard.next")}</p>
    </section>
  );
}
