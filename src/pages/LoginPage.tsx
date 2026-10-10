// src/pages/LoginPage.tsx
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SplashScreen } from "@/shared/components/SplashScreen";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getHomePath } from "@/features/auth/utils/getHomePath";
import { PreferencesButton } from "@/features/preferences/components/PreferencesButton";
import { PreferencesPopup } from "@/features/preferences/components/PreferencesPopup";

export default function LoginPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Deep link the user was sent away from, if any; otherwise the role's home.
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  if (isLoading) return <SplashScreen />;
  if (user) return <Navigate to={from ?? getHomePath(user.role)} replace />;

  return (
    <div className="grid min-h-dvh md:grid-cols-[5fr_6fr]">
      <PreferencesPopup />
      <aside className="hidden flex-col justify-end bg-rail p-10 text-rail-fg md:flex">
        <p className="max-w-xs text-3xl font-semibold leading-tight tracking-tight">
          Menú, precios y stock al día. Sin llamar a nadie.
        </p>
      </aside>
      <main className="flex flex-col bg-paper p-6">
        <div className="flex justify-end"><PreferencesButton /></div>
        <div className="m-auto w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">{t("auth.title")}</h1>
          <p className="mb-6 mt-1 text-sm text-ink/70">{t("auth.subtitle")}</p>
          <LoginForm onSuccess={(u) => navigate(from ?? getHomePath(u.role), { replace: true })} />
        </div>
      </main>
    </div>
  );
}
