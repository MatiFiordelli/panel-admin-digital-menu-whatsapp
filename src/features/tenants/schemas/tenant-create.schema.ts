// src/features/tenants/schemas/tenant-create.schema.ts
import { z } from "zod";
import type { TFunction } from "i18next";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DOMAIN = /^(?=.{3,253}$)([a-z0-9-]+\.)+[a-z]{2,}$/;

function validTimezone(v: string): boolean {
  try { new Intl.DateTimeFormat(undefined, { timeZone: v }); return true; } catch { return false; }
}

/** Built per language so messages stay translated. Rules mirror what the API and the catalog's schema require. */
export function buildTenantCreateSchema(t: TFunction) {
  const req = t("tenants.errors.required");
  return z
    .object({
      // Business (the catalog rejects empty name/address/phone/whatsapp: tenant config would fail to parse)
      name: z.string().trim().min(1, req).max(100),
      address: z.string().trim().min(1, req).max(200),
      phone: z.string().trim().min(1, req).max(40),
      whatsappNumber: z.string().trim().regex(/^\d{8,15}$/, t("tenants.errors.whatsapp")),
      // Account
      slug: z.string().trim().min(2, t("tenants.errors.slug")).max(50, t("tenants.errors.slug")).regex(SLUG, t("tenants.errors.slug")),
      plan: z.enum(["trial", "basic", "pro", "premium"]),
      trialEndsAt: z.string(), // required only when plan = trial (see superRefine)
      contactEmail: z.string().trim().email(t("tenants.errors.email")),
      customDomain: z.string().trim().refine((v) => v === "" || DOMAIN.test(v), t("tenants.errors.domain")),
      // Region
      locale: z.enum(["es-AR", "pt-BR", "en-US", "zh-CN"]),
      timezone: z.string().trim().refine(validTimezone, t("tenants.errors.timezone")),
      // Images
      cloudName: z.string().trim().min(1, req),
      defaultWidth: z.number({ message: t("tenants.errors.number") }).int(t("tenants.errors.number")).min(16, t("tenants.errors.number")).max(4096, t("tenants.errors.number")),
      defaultExtension: z.enum(["webp", "avif", "jpg", "png"]),
    })
    .superRefine((v, ctx) => {
      if (v.plan === "trial" && !v.trialEndsAt) {
        ctx.addIssue({ code: "custom", path: ["trialEndsAt"], message: t("tenants.errors.trialEndsAt") });
      }
    });
}

export type TenantCreateValues = z.infer<ReturnType<typeof buildTenantCreateSchema>>;
