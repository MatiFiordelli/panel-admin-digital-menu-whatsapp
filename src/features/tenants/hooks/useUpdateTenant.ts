// src/features/tenants/hooks/useUpdateTenant.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantsService } from "@/features/tenants/services/tenants.service";

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) => tenantsService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tenants"] }), // list, switcher and detail
  });
}
