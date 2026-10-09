// src/shared/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Role } from "@/core/types";

interface Props { roles?: Role[] }

/** Requires a session; optionally restricts to a role list (never `role === "X"` branching). */
export function ProtectedRoute({ roles }: Props) {
  const { t } = useTranslation();
  const { user, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) return <div role="status" className="grid min-h-dvh place-items-center text-sm text-ink/60">{t("common.loading")}</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !hasRole(...roles)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
