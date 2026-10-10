// src/core/types/index.ts

/** Role list rather than hardcoded checks, so a future "employee" role is a one-line addition. */
export const ROLES = ["SuperAdmin", "TenantAdmin"] as const;
export type Role = (typeof ROLES)[number];

/** Shape returned by POST /auth/login -> data.user (minimal). */
export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  tenantId: string | null;
}

/** Shape returned by GET /auth/me -> data (full User.toJSON()). */
export interface User extends SessionUser {
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pagination as the API actually returns it. /admin/tenants and /users send numbers;
 * /products sends page/limit as strings. One normalizer covers every endpoint.
 */
export interface RawPagination {
  page?: string | number;
  limit?: string | number;
  total: number;
  pages: number | null;
}
export interface Pagination { page: number; limit: number; total: number; pages: number }

export function normalizePagination(p: RawPagination | undefined, fallbackLimit = 10): Pagination {
  const limit = Number(p?.limit ?? fallbackLimit) || fallbackLimit;
  const total = p?.total ?? 0;
  return {
    page: Number(p?.page ?? 1) || 1,
    limit,
    total,
    pages: p?.pages ?? Math.max(1, Math.ceil(total / limit)),
  };
}

/** Standard API envelope: every endpoint returns this. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  pagination?: RawPagination;
}

/** Tenant as returned by /admin/tenants (toAdminJSON). business/ui/infra are typed loosely until Phase 2b/5. */
export interface Tenant {
  id: string;
  tenantId: string;
  metadata: {
    slug: string;
    isActive: boolean;
    version?: string;
    plan: "trial" | "basic" | "pro" | "premium";
    locale: string;
    timezone: string;
    customDomain?: string | null;
    contactEmail: string;
    trialEndsAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    appTitle?: Partial<Record<"es" | "en" | "pt" | "zh", string>>;
    appDescription?: Partial<Record<"es" | "en" | "pt" | "zh", string>>;
    seo?: Record<string, unknown>;
    structuredData?: Record<string, unknown>;
  };
  business?: { companyInfo?: { name?: string } } & Record<string, unknown>;
  ui?: Record<string, unknown>;
  infra?: Record<string, unknown>;
}
