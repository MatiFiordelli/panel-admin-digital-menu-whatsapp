// src/features/auth/components/LoginForm.tsx
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { UI_CONFIG } from "@/core/config/ui.config";
import { ApiError } from "@/core/lib/axios";
import type { SessionUser } from "@/core/types";
import { FormField } from "@/shared/components/ui/FormField";
import { btnPrimary, inputCls } from "@/shared/components/ui/form-styles";

interface Props { onSuccess: (user: SessionUser) => void }

export function LoginForm({ onSuccess }: Props) {
  const { t, i18n } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();

  // Rebuilt when the language changes so validation messages stay translated.
  const schema = useMemo(
    () =>
      z.object({
        email: z.string().trim().email(t("auth.emailInvalid")),
        password: z.string().min(1, t("auth.passwordRequired")),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );
  type Values = z.infer<typeof schema>;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), mode: UI_CONFIG.FORMS.VALIDATION_MODE });
  const email = watch("email");

  // 423 (locked) shows the server message verbatim: it includes the minutes remaining.
  const serverError = (() => {
    const e = login.error;
    if (!e) return null;
    if (!(e instanceof ApiError)) return t("errors.generic");
    if (e.status === 423) return e.message;
    if (e.status === 401) return t("auth.invalid");
    if (e.status === 0) return t("errors.network");
    return t("errors.generic");
  })();

  return (
    <form noValidate onSubmit={handleSubmit((v) => login.mutate(v, { onSuccess }))}>
      <FormField
        id="email" required label={t("auth.email")} error={errors.email?.message}
        clearable hasValue={!!email} onClear={() => { setValue("email", "", { shouldDirty: true, shouldValidate: true }); document.getElementById("email")?.focus(); }}
      >
        <input
          id="email" type="email" autoComplete="username" autoFocus placeholder={t("auth.emailPlaceholder")}
          aria-required="true" aria-invalid={!!errors.email} aria-describedby="email-msg" className={`${inputCls} pr-9`} {...register("email")}
        />
      </FormField>

      <FormField id="password" required label={t("auth.password")} error={errors.password?.message}>
        <input
          id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder={t("auth.passwordPlaceholder")}
          aria-required="true" aria-invalid={!!errors.password} aria-describedby="password-msg" className={`${inputCls} pr-20`} {...register("password")}
        />
        <button
          type="button" onClick={() => setShowPassword((s) => !s)} aria-pressed={showPassword}
          className="absolute inset-y-0 right-0 rounded-r-md px-3 text-xs font-medium text-brand-text hover:underline focus-visible:outline-2 focus-visible:outline-brand-text"
        >
          {showPassword ? t("auth.hide") : t("auth.show")}
        </button>
      </FormField>

      <div className="min-h-12">
        {serverError && (
          <p role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{serverError}</p>
        )}
      </div>

      <button type="submit" disabled={login.isPending} className={`${btnPrimary} w-full py-2.5`}>
        {login.isPending ? t("auth.submitting") : t("auth.submit")}
      </button>
    </form>
  );
}
