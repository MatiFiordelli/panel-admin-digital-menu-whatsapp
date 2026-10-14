// src/features/users/services/users.service.ts
import { http } from "@/core/lib/axios";
import { ENDPOINTS } from "@/core/config/api.config";
import { normalizePagination, type ApiResponse, type Pagination, type User } from "@/core/types";

export interface UsersPage { items: User[]; pagination: Pagination }
/** tenantId is the tenant's SLUG. A SuperAdmin never carries a tenant, so this panel only creates TenantAdmin users. */
export interface CreateUserPayload { email: string; password: string; role: "TenantAdmin"; tenantId: string }
export interface UpdateUserPayload { isActive?: boolean; unlock?: boolean; password?: string }

export const usersService = {
  /** GET /users?tenantId=<slug>&page&limit (SuperAdmin only). Max limit 100. */
  async list(tenantId: string, page: number, limit: number): Promise<UsersPage> {
    const { data } = await http.get<ApiResponse<User[]>>(ENDPOINTS.users, { params: { tenantId, page, limit } });
    return { items: data.data ?? [], pagination: normalizePagination(data.pagination, limit) };
  },
  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await http.post<ApiResponse<User>>(ENDPOINTS.users, payload);
    return data.data as User;
  },
  /** PATCH /users/:id. `unlock: true` clears a lockout; tenantId cannot be changed here. */
  async update(id: string, body: UpdateUserPayload): Promise<User> {
    const { data } = await http.patch<ApiResponse<User>>(`${ENDPOINTS.users}/${id}`, body);
    return data.data as User;
  },
};
