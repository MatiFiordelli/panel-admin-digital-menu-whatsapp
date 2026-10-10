// src/pages/TenantsPage.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTenantsPage } from "@/features/tenants/hooks/useTenants";
import { TenantsTable } from "@/features/tenants/components/TenantsTable";
import { DataPagination } from "@/shared/components/DataPagination";

export default function TenantsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading, isError, refetch } = useTenantsPage(page, limit);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{t("tenants.title")}</h1>

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
