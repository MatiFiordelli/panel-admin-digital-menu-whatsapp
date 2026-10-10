// src/features/tenants/components/TenantsTable.tsx
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "@/core/store/ui-store";
import { GLOBAL_QUERY_ROOTS } from "@/core/config/api.config";
import type { Tenant } from "@/core/types";

interface Props { tenants: Tenant[]; isLoading: boolean; limit: number }

export function TenantsTable({ tenants, isLoading, limit }: Props) {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const active = useUiStore((s) => s.activeTenantSlug);
  const setActiveTenant = useUiStore((s) => s.setActiveTenant);

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" });
  const th = "px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink/60";

  // Entering a tenant: drop tenant-scoped cache so nothing from the previous context leaks.
  const enter = (slug: string) => {
    setActiveTenant(slug);
    qc.removeQueries({ predicate: (q) => !(GLOBAL_QUERY_ROOTS as readonly string[]).includes(String(q.queryKey[0])) });
    navigate("/dashboard");
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-ink/15 bg-surface">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-ink/15 bg-ink/[0.03]">
          <tr>
            <th className={th}>{t("tenants.name")}</th>
            <th className={th}>{t("tenants.slugDomain")}</th>
            <th className={th}>{t("tenants.status")}</th>
            <th className={th}>{t("tenants.createdAt")}</th>
            <th className={`${th} text-right`}>{t("tenants.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: Math.min(limit, 5) }, (_, i) => (
              <tr key={i} className="odd:bg-surface even:bg-ink/[0.025]">
                {Array.from({ length: 5 }, (_, j) => (
                  <td key={j} className="px-3 py-3"><div className="h-4 w-full max-w-32 animate-pulse rounded bg-ink/10" /></td>
                ))}
              </tr>
            ))}

          {!isLoading && tenants.length === 0 && (
            <tr><td colSpan={5} className="px-3 py-12 text-center text-ink/60">{t("tenants.empty")}</td></tr>
          )}

          {tenants.map((tn) => {
            const slug = tn.metadata.slug;
            const name = tn.business?.companyInfo?.name || slug;
            const isActive = tn.metadata.isActive;
            return (
              <tr key={tn.id} className="odd:bg-surface even:bg-ink/[0.025] hover:outline hover:outline-1 hover:-outline-offset-1 hover:outline-brand/50">
                <td className="px-3 py-2.5 font-medium">{name}</td>
                <td className="px-3 py-2.5 text-ink/70">
                  <div>{slug}</div>
                  {tn.metadata.customDomain && <div className="text-xs">{tn.metadata.customDomain}</div>}
                </td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${isActive ? "bg-brand/10 text-brand-text" : "bg-danger/10 text-danger"}`}>
                    {isActive ? t("tenants.active") : t("tenants.suspended")}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-ink/70">{tn.metadata.createdAt ? fmt.format(new Date(tn.metadata.createdAt)) : "—"}</td>
                <td className="px-3 py-2.5 text-right">
                  <button
                    onClick={() => enter(slug)} disabled={!isActive || active === slug}
                    className="rounded-md border border-ink/25 px-3 py-1 text-xs font-medium hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    {active === slug ? t("tenants.current") : t("tenants.manage")}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
