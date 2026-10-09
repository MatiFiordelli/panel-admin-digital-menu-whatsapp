// src/pages/LoginPage.tsx
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LanguageSelector } from "@/shared/components/LanguageSelector";

export default function LoginPage() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/dashboard";

  if (!isLoading && isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className="grid min-h-dvh md:grid-cols-[5fr_6fr]">
      <aside className="hidden flex-col justify-end bg-ink p-10 text-paper md:flex">
        <p className="max-w-xs text-3xl font-semibold leading-tight tracking-tight">
          Menú, precios y stock al día. Sin llamar a nadie.
        </p>
      </aside>
      <main className="flex flex-col bg-paper p-6">
        <div className="flex justify-end"><LanguageSelector /></div>
        <div className="m-auto w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">{t("auth.title")}</h1>
          <p className="mb-6 mt-1 text-sm text-ink/70">{t("auth.subtitle")}</p>
          <LoginForm onSuccess={() => navigate(from, { replace: true })} />
        </div>
      </main>
    </div>
  );
}
