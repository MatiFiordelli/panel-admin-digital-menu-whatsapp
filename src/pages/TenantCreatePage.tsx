// src/pages/TenantCreatePage.tsx
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { TenantCreateForm } from "@/features/tenants/components/TenantCreateForm";

export default function TenantCreatePage() {
  const { t } = useTranslation();
  useDocumentTitle(t("tenants.newTitle"));
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{t("tenants.newTitle")}</h1>
      <p className="rounded-md border border-brand/30 bg-brand/5 px-3 py-2 text-sm">{t("tenants.templateNote")}</p>
      <TenantCreateForm />
    </section>
  );
}
