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

/** Raw pagination shape returned by the API. */
export interface RawPagination {
  page?: string | number;
  limit?: string | number;
  total: number;
  pages: number | null;
}

/** Normalized pagination shape used internally by the panel. */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function normalizePagination(
  p: RawPagination,
  fallbackLimit: number
): Pagination {
  const limit = Number(p.limit ?? fallbackLimit);

  return {
    page: Number(p.page ?? 1),
    limit,
    total: p.total,
    pages: p.pages ?? Math.max(1, Math.ceil(p.total / limit)),
  };
}

/** Standard API envelope: every endpoint returns this. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: RawPagination;
}