// src/shared/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getHomePath } from "@/features/auth/utils/getHomePath";
import { SplashScreen } from "@/shared/components/SplashScreen";
import type { Role } from "@/core/types";

interface Props { roles?: Role[] }

/** Requires a session; optionally restricts to a role list (never `role === "X"` branching). */
export function ProtectedRoute({ roles }: Props) {
  const { user, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) return <SplashScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !hasRole(...roles)) return <Navigate to={getHomePath(user.role)} replace />;
  return <Outlet />;
}
