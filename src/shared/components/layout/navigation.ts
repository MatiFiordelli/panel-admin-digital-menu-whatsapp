// src/shared/components/layout/navigation.ts
// Sidebar config. Add a line here when a later phase ships its route.
import type { Role } from "@/core/types";

export interface NavItem { to: string; labelKey: string; roles: Role[] }

export const NAV_ITEMS: NavItem[] = [
  { to: "/tenants", labelKey: "nav.tenants", roles: ["SuperAdmin"] },
  { to: "/dashboard", labelKey: "nav.dashboard", roles: ["SuperAdmin", "TenantAdmin"] },
  // Phase 3: /products   Phase 4: /categories   Phase 5: /settings
];

/** Breadcrumb label key per first path segment. */
export const CRUMBS: Record<string, string> = {
  tenants: "nav.tenants",
  dashboard: "nav.dashboard",
};
