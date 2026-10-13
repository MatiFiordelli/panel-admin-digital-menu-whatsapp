// src/features/tenants/hooks/useCreateTenant.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantsService } from "@/features/tenants/services/tenants.service";

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tenantsService.create,
    // Refresh the list and the switcher (both live under the "tenants" key root).
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tenants"] }),
  });
}
