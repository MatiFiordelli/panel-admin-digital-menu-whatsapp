// src/pages/TenantEditPage.tsx
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { ApiError } from "@/core/lib/axios";
import { TenantAccess } from "@/features/users/components/TenantAccess";
import { TenantEditForm } from "@/features/tenants/components/TenantEditForm";
import { useTenant } from "@/features/tenants/hooks/useTenant";
import { useBreadcrumbLabel } from "@/shared/components/layout/breadcrumb-store";
import { btnSecondary } from "@/shared/components/ui/form-styles";

export default function TenantEditPage() {
  const { t } = useTranslation();
  useDocumentTitle(t("tenants.edit.title"));
  const { id } = useParams();
  const { data: tenant, isLoading, error, refetch } = useTenant(id);
  useBreadcrumbLabel(`/tenants/${id}`, tenant ? tenant.business?.companyInfo?.name || tenant.metadata.slug : undefined);

  if (isLoading) {
    return <div className="space-y-3" aria-busy><div className="h-8 w-48 animate-pulse rounded bg-ink/10" /><div className="h-64 animate-pulse rounded-lg bg-ink/10" /></div>;
  }

  if (error || !tenant) {
    const missing = error instanceof ApiError && error.status === 404;
    return (
      <div role="alert" className="space-y-3 rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
        <p>{missing ? t("tenants.edit.notFound") : t("tenants.edit.loadError")}</p>
        <div className="flex gap-2">
          {!missing && <button onClick={() => refetch()} className={btnSecondary}>{t("common.retry")}</button>}
          <Link to="/tenants" className={btnSecondary}>{t("tenants.edit.back")}</Link>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{t("tenants.edit.title")}</h1>
      <TenantEditForm tenant={tenant} />
      <TenantAccess slug={tenant.metadata.slug} />
    </section>
  );
}
