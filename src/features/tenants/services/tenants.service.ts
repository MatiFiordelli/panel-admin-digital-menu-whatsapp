// src/features/tenants/services/tenants.service.ts
import { http } from "@/core/lib/axios";
import { ENDPOINTS } from "@/core/config/api.config";
import { normalizePagination, type ApiResponse, type Pagination, type Tenant } from "@/core/types";

export interface TenantPage { items: Tenant[]; pagination: Pagination }

/** Body of POST /admin/tenants. tenantId is NOT sent: the API derives it from metadata.slug. */
export interface CreateTenantPayload {
  metadata: {
    slug: string;
    plan: string;
    locale: string;
    timezone: string;
    contactEmail: string;
    isActive: boolean;
    version: string;
    customDomain?: string; // omitted when empty: the field is unique + sparse, so null/"" would collide
    trialEndsAt?: string;
    appTitle?: Record<string, string>;
    appDescription?: Record<string, string>;
  };
  business: Record<string, unknown>;
  ui: Record<string, unknown>;
  infra: Record<string, unknown>;
}

export const tenantsService = {
  /** GET /admin/tenants/:id (Mongo id). */
  async get(id: string): Promise<Tenant> {
    const { data } = await http.get<ApiResponse<Tenant>>(`${ENDPOINTS.adminTenants}/${id}`);
    return data.data as Tenant;
  },

  /** PATCH /admin/tenants/:id. The API DEEP-MERGES: send only what changed (see deepDiff). slug is immutable. */
  async update(id: string, patch: Record<string, unknown>): Promise<Tenant> {
    const { data } = await http.patch<ApiResponse<Tenant>>(`${ENDPOINTS.adminTenants}/${id}`, patch);
    return data.data as Tenant;
  },

  async create(payload: CreateTenantPayload): Promise<Tenant> {
    const { data } = await http.post<ApiResponse<Tenant>>(ENDPOINTS.adminTenants, payload);
    return data.data as Tenant;
  },

  /** GET /admin/tenants?page&limit. Max limit is 100 (more -> 400), so always send explicit values. */
  async list(page: number, limit: number): Promise<TenantPage> {
    const { data } = await http.get<ApiResponse<Tenant[]>>(ENDPOINTS.adminTenants, { params: { page, limit } });
    return { items: data.data ?? [], pagination: normalizePagination(data.pagination, limit) };
  },
};
