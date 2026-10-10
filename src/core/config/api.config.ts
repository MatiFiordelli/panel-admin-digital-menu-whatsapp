// src/core/config/api.config.ts
// Single place for env vars and endpoint strings.

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export const ENDPOINTS = {
  auth: { login: "/auth/login", logout: "/auth/logout", me: "/auth/me" },
  /** Connectivity probe. If `GET /api/v1/health/live` answers 200, point this at it: it is lighter (no auth/DB lookup). */
  probe: "/auth/me",
  adminTenants: "/admin/tenants",
  users: "/users",
} as const;

export const STORAGE_KEYS = {
  language: "admin-language", // UI language only; never auth state
} as const;

export const QUERY_KEYS = {
  me: ["auth", "me"] as const,
  tenants: (page: number, limit: number) => ["tenants", "list", page, limit] as const,
  tenantsAll: ["tenants", "all"] as const,
};

/** Query-key roots that are NOT tenant-scoped; everything else is dropped when the active tenant changes. */
export const GLOBAL_QUERY_ROOTS = ["auth", "tenants"] as const;
