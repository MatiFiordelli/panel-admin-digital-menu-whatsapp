// src/features/auth/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";
import { QUERY_KEYS } from "@/core/config/api.config";
import { useUiStore } from "@/core/store/ui-store";
import type { Role } from "@/core/types";

export function useAuth() {
  const qc = useQueryClient();

  const { data: user = null, isLoading } = useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: authService.me,
    staleTime: 5 * 60_000,
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      useUiStore.getState().setActiveTenant(null);
      // Order matters. Setting the session to null FIRST notifies the mounted observers,
      // which re-renders ProtectedRoute and redirects to /login. Calling qc.clear() here
      // would detach those observers from the query and the UI would never update.
      qc.setQueryData(QUERY_KEYS.me, null);
      // Then drop every other cached query (tenant-scoped data must not survive a logout).
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "auth" });
    },
  });

  const hasRole = (...roles: Role[]) => !!user && roles.includes(user.role);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === "SuperAdmin",
    isTenantAdmin: user?.role === "TenantAdmin",
    hasRole,
    logout: () => logoutMutation.mutate(),
  };
}
