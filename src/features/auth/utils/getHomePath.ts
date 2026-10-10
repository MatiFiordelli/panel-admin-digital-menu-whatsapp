// src/features/auth/utils/getHomePath.ts
import type { Role } from "@/core/types";

/** Post-login landing page. SuperAdmin -> /tenants, everyone else -> /dashboard. */
export function getHomePath(role: Role): string {
  return role === "SuperAdmin" ? "/tenants" : "/dashboard";
}
