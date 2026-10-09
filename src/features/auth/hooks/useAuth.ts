// src/features/auth/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";
import { QUERY_KEYS } from "@/core/config/api.config";
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
      qc.clear(); // drop every cached tenant-scoped query
      qc.setQueryData(QUERY_KEYS.me, null);
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
