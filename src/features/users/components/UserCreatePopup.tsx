// src/features/users/components/UserCreatePopup.tsx
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { UI_CONFIG } from "@/core/config/ui.config";
import { ApiError } from "@/core/lib/axios";
import { parseValidationErrors } from "@/core/lib/api-errors";
import { notify } from "@/core/notifications/notify";
import type { NotifyParams } from "@/core/notifications/params";
import { generatePassword } from "@/features/users/lib/password";
import { buildUserCreateSchema, type UserCreateValues } from "@/features/users/schemas/user-create.schema";
import { useCreateUser } from "@/features/users/hooks/useUsers";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { FormField } from "@/shared/components/ui/FormField";
import { Popup } from "@/shared/components/ui/Popup";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { btnPrimary, btnSecondary, inputCls } from "@/shared/components/ui/form-styles";

interface Props { open: boolean; onClose: () => void; slug: string }

export function UserCreatePopup({ open, onClose, slug }: Props) {
  const { t, i18n } = useTranslation();
  const create = useCreateUser();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState<UserCreateValues | null>(null); // awaiting the "create?" confirmation
  const [formError, setFormError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const schema = useMemo(() => buildUserCreateSchema(t), [i18n.language]);
  const { register, handleSubmit, watch, setValue, getValues, setError, reset, formState: { errors } } = useForm<UserCreateValues>({
    resolver: zodResolver(schema),
    mode: UI_CONFIG.FORMS.VALIDATION_MODE,
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });
  const { email, password } = watch();

  // A fresh form every time the popup opens.
  useEffect(() => {
    if (!open) { reset(); setShowPassword(false); setPending(null); setFormError(null); }
  }, [open, reset]);

  const generate = () => {
    const generated = generatePassword();
    setValue("password", generated, { shouldDirty: true, shouldValidate: true });
    setValue("confirmPassword", generated, { shouldDirty: true, shouldValidate: true }); // generated: both boxes match
    setShowPassword(true); // so the person creating the user can see (and copy) it
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(getValues("password")); notify.success("access.copied"); }
    catch { notify.error("access.copyError"); }
  };

  const explain = (e: unknown, v: UserCreateValues): { key: string; params?: NotifyParams } => {
    setFormError(null);
    if (!(e instanceof ApiError)) return { key: "access.createError" };
    if (e.status === 0) return { key: "errors.network" };
    if (e.status === 404) return { key: "tenants.edit.notFound" };
    if (e.status === 409) {
      setError("email", { message: t("access.errors.duplicate") });
      return { key: "access.errors.duplicateEmail", params: { email: v.email } };
    }
    if (e.status === 400) {
      const details: NotifyParams[string][] = [];
      const unmapped: string[] = [];
      for (const issue of parseValidationErrors(e.message)) {
        if (issue.field === "email" || issue.field === "password") {
          setError(issue.field, { message: issue.message });
          details.push({ $t: `access.fields.${issue.field}`, then: `: ${issue.message}` });
        } else {
          const text = issue.field ? `${issue.field}: ${issue.message}` : issue.message;
          unmapped.push(text); details.push(text);
        }
      }
      if (unmapped.length) setFormError(unmapped.join(" · "));
      return { key: "tenants.errors.validation", params: { details } };
    }
    setFormError(e.message);
    return { key: "access.createErrorDetail", params: { detail: e.message } };
  };

  const confirmCreate = () => {
    if (!pending) return;
    const v = pending;
    setPending(null);
    create.mutate({ email: v.email, password: v.password, role: "TenantAdmin", tenantId: slug }, {
      onSuccess: () => { notify.success("access.created", { email: v.email }); onClose(); },
      onError: (e) => { const n = explain(e, v); notify.error(n.key, n.params); },
    });
  };

  return (
    <>
      <Popup open={open} onClose={onClose} title={t("access.addTitle")}>
        {/* Submitting (button or Enter) only validates; nothing is sent until the confirmation. */}
        <form noValidate onSubmit={handleSubmit((v) => setPending(v))}>
          <p className="mb-3 text-xs text-ink/70">{t("common.requiredNote")}</p>

          <FormField
            id="user-email" required label={t("access.fields.email")} error={errors.email?.message}
            clearable hasValue={!!email} onClear={() => { setValue("email", "", { shouldDirty: true, shouldValidate: true }); document.getElementById("user-email")?.focus(); }}
          >
            <input
              id="user-email" type="email" autoComplete="off" autoCapitalize="none" spellCheck={false}
              placeholder={t("access.placeholders.email")} className={`${inputCls} pr-9`}
              aria-required="true" aria-invalid={!!errors.email} aria-describedby="user-email-msg" {...register("email")}
            />
          </FormField>

          <FormField id="user-password" required label={t("access.fields.password")} hint={t("access.passwordHint")} error={errors.password?.message}>
            <input
              id="user-password" type={showPassword ? "text" : "password"} autoComplete="new-password" spellCheck={false}
              placeholder={t("access.placeholders.password")} className={`${inputCls} pr-20`}
              aria-required="true" aria-invalid={!!errors.password} aria-describedby="user-password-msg"
              {...register("password", { deps: ["confirmPassword"] })} // re-check the repeat box whenever this one changes
            />
            <button
              type="button" onClick={() => setShowPassword((s) => !s)} aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 rounded-r-md px-3 text-xs font-medium text-brand-text hover:underline focus-visible:outline-2 focus-visible:outline-brand-text"
            >
              {showPassword ? t("auth.hide") : t("auth.show")}
            </button>
          </FormField>

          <FormField id="user-password-confirm" required label={t("access.fields.confirmPassword")} error={errors.confirmPassword?.message}>
            <input
              id="user-password-confirm" type={showPassword ? "text" : "password"} autoComplete="new-password" spellCheck={false}
              placeholder={t("access.placeholders.confirmPassword")} className={inputCls}
              aria-required="true" aria-invalid={!!errors.confirmPassword} aria-describedby="user-password-confirm-msg" {...register("confirmPassword")}
            />
          </FormField>

          <div className="-mt-1 mb-3 flex flex-wrap gap-2">
            <Tooltip label={t("tooltips.generatePassword")}>
              <button type="button" onClick={generate} className={`${btnSecondary} px-3 py-1.5 text-xs`}>{t("access.generate")}</button>
            </Tooltip>
            <Tooltip label={t("tooltips.copyPassword")}>
              <button type="button" onClick={copy} disabled={!password} className={`${btnSecondary} px-3 py-1.5 text-xs`}>{t("access.copy")}</button>
            </Tooltip>
          </div>

          <p className="mb-3 text-sm"><span className="font-medium">{t("access.fields.role")}:</span> {t("access.roleValue")}</p>

          <div className="min-h-10">
            {formError && <p role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{formError}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className={btnSecondary} disabled={create.isPending}>{t("tenants.form.cancel")}</button>
            <button type="submit" className={btnPrimary} disabled={create.isPending}>
              {create.isPending ? t("tenants.form.submitting") : t("access.create")}
            </button>
          </div>
        </form>
      </Popup>

      <ConfirmDialog
        open={pending !== null}
        title={t("access.confirmCreate.title")}
        body={t("access.confirmCreate.body", { email: pending?.email ?? "", slug })}
        confirmLabel={t("access.confirmCreate.confirm")} cancelLabel={t("tenants.confirmCreate.review")}
        onCancel={() => setPending(null)} onConfirm={confirmCreate}
      />
    </>
  );
}
