// src/features/auth/hooks/useLogin.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";
import { QUERY_KEYS } from "@/core/config/api.config";

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.login,
    // /auth/login returns a minimal user; refetch /auth/me for the full shape.
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.me }),
  });
}
