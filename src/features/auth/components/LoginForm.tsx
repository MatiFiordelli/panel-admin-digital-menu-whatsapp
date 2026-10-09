// src/features/auth/components/LoginForm.tsx
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { ApiError } from "@/core/lib/axios";

interface Props { onSuccess: () => void }

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

  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
  });

  // 423 (locked) shows the server message verbatim: it includes the minutes remaining.
  // 401 uses our translated copy; anything else is a generic/network error.
  const serverError = (() => {
    const e = login.error;
    if (!e) return null;
    if (!(e instanceof ApiError)) return t("errors.generic");
    if (e.status === 423) return e.message;
    if (e.status === 401) return t("auth.invalid");
    if (e.status === 0) return t("errors.network");
    return t("errors.generic");
  })();

  const field =
    "mt-1 block w-full rounded-md border border-ink/25 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand aria-[invalid=true]:border-danger";

  return (
    <form noValidate onSubmit={handleSubmit((v) => login.mutate(v, { onSuccess }))} className="space-y-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium">{t("auth.email")}</label>
        <input
          id="email" type="email" autoComplete="username" autoFocus
          aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined}
          className={field} {...register("email")}
        />
        {errors.email && <p id="email-err" className="mt-1 text-sm text-danger">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium">{t("auth.password")}</label>
        <div className="relative">
          <input
            id="password" type={showPassword ? "text" : "password"} autoComplete="current-password"
            aria-invalid={!!errors.password} aria-describedby={errors.password ? "pw-err" : undefined}
            className={`${field} pr-20`} {...register("password")}
          />
          <button
            type="button" onClick={() => setShowPassword((s) => !s)}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 mt-1 rounded-r-md px-3 text-xs font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand"
          >
            {showPassword ? t("auth.hide") : t("auth.show")}
          </button>
        </div>
        {errors.password && <p id="pw-err" className="mt-1 text-sm text-danger">{errors.password.message}</p>}
      </div>

      {serverError && (
        <p role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {serverError}
        </p>
      )}

      <button
        type="submit" disabled={login.isPending}
        className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {login.isPending ? t("auth.submitting") : t("auth.submit")}
      </button>
    </form>
  );
}
