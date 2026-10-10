// src/features/tenants/services/tenants.service.ts
import { http } from "@/core/lib/axios";
import { ENDPOINTS } from "@/core/config/api.config";
import { normalizePagination, type ApiResponse, type Pagination, type Tenant } from "@/core/types";

export interface TenantPage { items: Tenant[]; pagination: Pagination }

export const tenantsService = {
  /** GET /admin/tenants?page&limit. Max limit is 100 (more -> 400), so always send explicit values. */
  async list(page: number, limit: number): Promise<TenantPage> {
    const { data } = await http.get<ApiResponse<Tenant[]>>(ENDPOINTS.adminTenants, { params: { page, limit } });
    return { items: data.data ?? [], pagination: normalizePagination(data.pagination, limit) };
  },
};
