// src/pages/TenantsPage.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { btnPrimary } from "@/shared/components/ui/form-styles";
import { useTenantsPage } from "@/features/tenants/hooks/useTenants";
import { TenantsTable } from "@/features/tenants/components/TenantsTable";
import { DataPagination } from "@/shared/components/DataPagination";

export default function TenantsPage() {
  const { t } = useTranslation();
  useDocumentTitle(t("tenants.title"));
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading, isError, refetch } = useTenantsPage(page, limit);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{t("tenants.title")}</h1>
        <Link to="/tenants/new" className={btnPrimary}>{t("tenants.new")}</Link>
      </div>

      {isError ? (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          {t("tenants.loadError")}{" "}
          <button onClick={() => refetch()} className="font-semibold underline">{t("common.retry")}</button>
        </div>
      ) : (
        <>
          <TenantsTable tenants={data?.items ?? []} isLoading={isLoading} limit={limit} />
          {data && (
            <DataPagination
              pagination={data.pagination}
              onPageChange={setPage}
              onLimitChange={(l) => { setLimit(l); setPage(1); }}
            />
          )}
        </>
      )}
    </section>
  );
}
