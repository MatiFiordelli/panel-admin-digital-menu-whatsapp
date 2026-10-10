// src/shared/components/layout/TenantSwitcher.tsx
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAllTenants } from "@/features/tenants/hooks/useTenants";
import { useUiStore } from "@/core/store/ui-store";
import { GLOBAL_QUERY_ROOTS } from "@/core/config/api.config";

/** SuperAdmin-only. Options come from GET /admin/tenants, never free text (avoids slug/customDomain collisions). */
export function TenantSwitcher() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { isSuperAdmin } = useAuth();
  const { data: tenants = [] } = useAllTenants(isSuperAdmin);
  const active = useUiStore((s) => s.activeTenantSlug);
  const setActive = useUiStore((s) => s.setActiveTenant);

  if (!isSuperAdmin) return null;

  const change = (slug: string) => {
    setActive(slug || null);
    qc.removeQueries({ predicate: (q) => !(GLOBAL_QUERY_ROOTS as readonly string[]).includes(String(q.queryKey[0])) });
  };

  return (
    <select
      aria-label={t("switcher.label")} value={active ?? ""} onChange={(e) => change(e.target.value)}
      className="max-w-44 rounded-md border border-ink/25 bg-surface px-2 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand-text"
    >
      <option value="">{t("switcher.global")}</option>
      {tenants.filter((tn) => tn.metadata.isActive).map((tn) => (
        <option key={tn.id} value={tn.metadata.slug}>{tn.business?.companyInfo?.name || tn.metadata.slug}</option>
      ))}
    </select>
  );
}
