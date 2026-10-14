// src/features/users/components/UserPasswordPopup.tsx
// SuperAdmin sets a NEW temporary password for a user who forgot theirs. It also clears any lockout (unlock: true).
// Already-open sessions of that person stay valid until the token expires (the API has no session revocation yet).
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { UI_CONFIG } from "@/core/config/ui.config";
import { ApiError } from "@/core/lib/axios";
import { parseValidationErrors } from "@/core/lib/api-errors";
import { notify } from "@/core/notifications/notify";
import type { User } from "@/core/types";
import { generatePassword } from "@/features/users/lib/password";
import { buildPasswordResetSchema, type PasswordResetValues } from "@/features/users/schemas/user-password.schema";
import { useUpdateUser } from "@/features/users/hooks/useUsers";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { FormField } from "@/shared/components/ui/FormField";
import { Popup } from "@/shared/components/ui/Popup";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { btnPrimary, btnSecondary, inputCls } from "@/shared/components/ui/form-styles";

interface Props { open: boolean; onClose: () => void; user: User }

export function UserPasswordPopup({ open, onClose, user }: Props) {
  const { t, i18n } = useTranslation();
  const update = useUpdateUser();
  const [showPassword, setShowPassword] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const schema = useMemo(() => buildPasswordResetSchema(t), [i18n.language]);
  const { register, handleSubmit, watch, setValue, getValues, setError, reset, formState: { errors } } = useForm<PasswordResetValues>({
    resolver: zodResolver(schema),
    mode: UI_CONFIG.FORMS.VALIDATION_MODE,
    reValidateMode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });
  const password = watch("password");

  useEffect(() => {
    if (!open) { reset(); setShowPassword(false); setConfirming(false); setFormError(null); }
  }, [open, reset]);

  const generate = () => {
    const generated = generatePassword();
    setValue("password", generated, { shouldDirty: true, shouldValidate: true });
    setValue("confirmPassword", generated, { shouldDirty: true, shouldValidate: true });
    setShowPassword(true);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(getValues("password")); notify.success("access.copied"); }
    catch { notify.error("access.copyError"); }
  };

  const send = () => {
    setConfirming(false);
    update.mutate({ id: user.id, body: { password: getValues("password"), unlock: true } }, {
      onSuccess: () => { notify.success("access.passwordReset", { email: user.email }); onClose(); },
      onError: (e) => {
        setFormError(null);
        if (e instanceof ApiError && e.status === 0) return notify.error("errors.network");
        if (e instanceof ApiError && e.status === 400) {
          const issues = parseValidationErrors(e.message);
          const onPassword = issues.find((i) => i.field === "password");
          if (onPassword) setError("password", { message: onPassword.message });
          else setFormError(issues.map((i) => (i.field ? `${i.field}: ${i.message}` : i.message)).join(" · "));
        }
        notify.error("access.updateError", { email: user.email });
      },
    });
  };

  return (
    <>
      <Popup open={open} onClose={onClose} title={t("access.resetTitle")}>
        <p className="mb-1 text-sm"><span className="font-medium">{t("access.fields.email")}:</span> {user.email}</p>
        <p className="mb-3 text-xs text-ink/70">{t("access.resetHint")}</p>
        <p className="mb-3 text-xs text-ink/70">{t("common.requiredNote")}</p>

        {/* Submitting (button or Enter) only validates; nothing is sent until the confirmation. */}
        <form noValidate onSubmit={handleSubmit(() => setConfirming(true))}>
          <FormField id="reset-password" required label={t("access.fields.newPassword")} hint={t("access.passwordHint")} error={errors.password?.message}>
            <input
              id="reset-password" type={showPassword ? "text" : "password"} autoComplete="new-password" spellCheck={false}
              placeholder={t("access.placeholders.password")} className={`${inputCls} pr-20`} autoFocus
              aria-required="true" aria-invalid={!!errors.password} aria-describedby="reset-password-msg"
              {...register("password", { deps: ["confirmPassword"] })}
            />
            <button
              type="button" onClick={() => setShowPassword((s) => !s)} aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 rounded-r-md px-3 text-xs font-medium text-brand-text hover:underline focus-visible:outline-2 focus-visible:outline-brand-text"
            >
              {showPassword ? t("auth.hide") : t("auth.show")}
            </button>
          </FormField>

          <FormField id="reset-password-confirm" required label={t("access.fields.confirmPassword")} error={errors.confirmPassword?.message}>
            <input
              id="reset-password-confirm" type={showPassword ? "text" : "password"} autoComplete="new-password" spellCheck={false}
              placeholder={t("access.placeholders.confirmPassword")} className={inputCls}
              aria-required="true" aria-invalid={!!errors.confirmPassword} aria-describedby="reset-password-confirm-msg" {...register("confirmPassword")}
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

          <div className="min-h-10">
            {formError && <p role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{formError}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className={btnSecondary} disabled={update.isPending}>{t("tenants.form.cancel")}</button>
            <button type="submit" className={btnPrimary} disabled={update.isPending}>
              {update.isPending ? t("tenants.form.submitting") : t("access.resetSubmit")}
            </button>
          </div>
        </form>
      </Popup>

      <ConfirmDialog
        open={confirming}
        title={t("access.resetConfirm.title")} body={t("access.resetConfirm.body", { email: user.email })}
        confirmLabel={t("access.resetConfirm.confirm")} cancelLabel={t("tenants.confirmCreate.review")}
        onCancel={() => setConfirming(false)} onConfirm={send}
      />
    </>
  );
}
