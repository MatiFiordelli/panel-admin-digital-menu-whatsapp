// src/features/users/components/TenantAccess.tsx
// "Access" section of the tenant edit page: who can log in and manage this tenant (TenantAdmin users).
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/core/lib/axios";
import { notify } from "@/core/notifications/notify";
import type { User } from "@/core/types";
import { UserCreatePopup } from "@/features/users/components/UserCreatePopup";
import { UserPasswordPopup } from "@/features/users/components/UserPasswordPopup";
import { useTenantUsers, useUpdateUser } from "@/features/users/hooks/useUsers";
import type { UpdateUserPayload } from "@/features/users/services/users.service";
import { DataPagination } from "@/shared/components/DataPagination";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { btnPrimary } from "@/shared/components/ui/form-styles";

const th = "px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink/70";
const small = "rounded-md border border-ink/25 px-3 py-1 text-xs font-medium transition-colors hover:bg-ink/5 active:scale-95 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-brand-text";

export function TenantAccess({ slug }: { slug: string }) {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [adding, setAdding] = useState(false);
  const [toDeactivate, setToDeactivate] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null); // kept after closing so the popup can finish its exit animation
  const [resetOpen, setResetOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useTenantUsers(slug, page, limit);
  const update = useUpdateUser();

  const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" });
  const dateTime = new Intl.DateTimeFormat(i18n.language, { dateStyle: "short", timeStyle: "short" });
  const isLocked = (u: User) => !!u.lockedUntil && new Date(u.lockedUntil).getTime() > Date.now();

  const run = (u: User, body: UpdateUserPayload, successKey: string) =>
    update.mutate({ id: u.id, body }, {
      onSuccess: () => notify.success(successKey, { email: u.email }),
      onError: (e) => {
        if (e instanceof ApiError && e.status === 0) return notify.error("errors.network");
        notify.error("access.updateError", { email: u.email });
      },
    });

  return (
    <section aria-labelledby="access-title" className="mt-4 rounded-lg border border-ink/15 bg-surface p-4 md:p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="access-title" className="text-sm font-semibold">{t("access.title")}</h2>
          <p className="text-xs text-ink/70">{t("access.subtitle")}</p>
        </div>
        <Tooltip label={t("tooltips.addUser")}>
          <button type="button" onClick={() => setAdding(true)} aria-haspopup="dialog" className={`${btnPrimary} px-3 py-1.5 text-xs`}>{t("access.add")}</button>
        </Tooltip>
      </div>

      {isError ? (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          {t("access.loadError")} <button onClick={() => refetch()} className="font-semibold underline">{t("common.retry")}</button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border border-ink/15">
            <table className="w-full min-w-[560px] text-sm">
              <caption className="sr-only">{t("access.title")}</caption>
              <thead className="border-b border-ink/15 bg-ink/[0.03]">
                <tr>
                  <th scope="col" className={th}>{t("access.fields.email")}</th>
                  <th scope="col" className={th}>{t("tenants.status")}</th>
                  <th scope="col" className={th}>{t("tenants.createdAt")}</th>
                  <th scope="col" className={`${th} text-right`}>{t("tenants.actions")}</th>
                </tr>
              </thead>
              <tbody aria-busy={isLoading}>
                {isLoading && Array.from({ length: 3 }, (_, i) => (
                  <tr key={i} className="odd:bg-surface even:bg-ink/[0.025]">
                    {Array.from({ length: 4 }, (_, j) => <td key={j} className="px-3 py-3"><div className="h-4 w-full max-w-32 animate-pulse rounded bg-ink/10" /></td>)}
                  </tr>
                ))}
                {!isLoading && (data?.items.length ?? 0) === 0 && (
                  <tr><td colSpan={4} className="px-3 py-8 text-center text-ink/70">{t("access.empty")}</td></tr>
                )}
                {data?.items.map((u) => {
                  const locked = isLocked(u);
                  return (
                    <tr key={u.id} className="odd:bg-surface even:bg-ink/[0.025]">
                      <td className="max-w-64 truncate px-3 py-2.5 font-medium" title={u.email}>{u.email}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${u.isActive ? "bg-brand/10 text-brand-text" : "bg-ink/10 text-ink/70"}`}>
                            {u.isActive ? t("access.active") : t("access.inactive")}
                          </span>
                          {locked && u.lockedUntil && (
                            <span className="inline-flex rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger" title={t("access.lockedUntil", { time: dateTime.format(new Date(u.lockedUntil)) })}>
                              {t("access.locked")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-ink/70">{date.format(new Date(u.createdAt))}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap justify-end gap-2">
                          {locked && (
                            <Tooltip label={t("tooltips.unlock")}>
                              <button type="button" className={small} disabled={update.isPending} aria-label={t("access.unlockFor", { email: u.email })}
                                onClick={() => run(u, { unlock: true }, "access.unlocked")}>{t("access.unlock")}</button>
                            </Tooltip>
                          )}
                          <Tooltip label={t("tooltips.resetPassword")}>
                            <button type="button" className={small} disabled={update.isPending} aria-haspopup="dialog" aria-label={t("access.resetFor", { email: u.email })}
                              onClick={() => { setResetUser(u); setResetOpen(true); }}>{t("access.reset")}</button>
                          </Tooltip>
                          {u.isActive ? (
                            <Tooltip label={t("tooltips.deactivate")}>
                              <button type="button" className={small} disabled={update.isPending} aria-label={t("access.deactivateFor", { email: u.email })}
                                onClick={() => setToDeactivate(u)}>{t("access.deactivate")}</button>
                            </Tooltip>
                          ) : (
                            <Tooltip label={t("tooltips.activate")}>
                              <button type="button" className={small} disabled={update.isPending} aria-label={t("access.activateFor", { email: u.email })}
                                onClick={() => run(u, { isActive: true }, "access.activated")}>{t("access.activate")}</button>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data && data.pagination.total > 0 && (
            <div className="mt-3">
              <DataPagination pagination={data.pagination} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} limitOptions={[10, 25, 50]} />
            </div>
          )}
        </>
      )}

      <UserCreatePopup open={adding} onClose={() => setAdding(false)} slug={slug} />
      {resetUser && <UserPasswordPopup open={resetOpen} onClose={() => setResetOpen(false)} user={resetUser} />}

      <ConfirmDialog
        open={toDeactivate !== null}
        title={t("access.confirmDeactivate.title")}
        body={t("access.confirmDeactivate.body", { email: toDeactivate?.email ?? "" })}
        confirmLabel={t("access.deactivate")} cancelLabel={t("tenants.confirmCreate.review")}
        onCancel={() => setToDeactivate(null)}
        onConfirm={() => { const u = toDeactivate; setToDeactivate(null); if (u) run(u, { isActive: false }, "access.deactivated"); }}
      />
    </section>
  );
}
