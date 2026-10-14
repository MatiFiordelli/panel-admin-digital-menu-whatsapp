// src/features/tenants/hooks/useTenant.ts
import { useQuery } from "@tanstack/react-query";
import { tenantsService } from "@/features/tenants/services/tenants.service";

/** One tenant by Mongo id. Lives under the "tenants" key root, so list invalidations refresh it too. */
export function useTenant(id: string | undefined) {
  return useQuery({
    queryKey: ["tenants", "detail", id],
    queryFn: () => tenantsService.get(id as string),
    enabled: !!id,
  });
}
