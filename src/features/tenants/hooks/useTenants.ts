// src/features/tenants/hooks/useTenants.ts
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { tenantsService } from "@/features/tenants/services/tenants.service";
import { QUERY_KEYS } from "@/core/config/api.config";

/** One page of tenants for the table. */
export function useTenantsPage(page: number, limit: number) {
  return useQuery({
    queryKey: QUERY_KEYS.tenants(page, limit),
    queryFn: () => tenantsService.list(page, limit),
    placeholderData: keepPreviousData,
  });
}

/** Real tenant list (max 100) feeding the switcher. Never free text: the header must carry a legitimate slug. */
export function useAllTenants(enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.tenantsAll,
    queryFn: () => tenantsService.list(1, 100).then((r) => r.items),
    enabled,
    staleTime: 5 * 60_000,
  });
}
