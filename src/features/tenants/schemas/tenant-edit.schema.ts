// src/features/tenants/schemas/tenant-edit.schema.ts
import { z } from "zod";
import type { TFunction } from "i18next";

const DOMAIN = /^(?=.{3,253}$)([a-z0-9-]+\.)+[a-z]{2,}$/;

function validTimezone(v: string): boolean {
  try { new Intl.DateTimeFormat(undefined, { timeZone: v }); return true; } catch { return false; }
}

/** What was already stored: an optional value that exists cannot be emptied (the API merges, it cannot unset). */
export interface EditContext { hadDomain: boolean; hadLatitude: boolean; hadLongitude: boolean }

export function buildTenantEditSchema(t: TFunction, ctx: EditContext) {
  const req = t("tenants.errors.required");
  const hex = z.string().trim().refine((v) => v === "" || /^#[0-9a-fA-F]{6}$/.test(v), t("tenants.errors.color"));
  const cloudId = z.string().trim().max(200).regex(/^[\w\-./]*$/, t("tenants.errors.cloudId"));
  const coord = (limit: number) =>
    z.string().trim().refine((v) => v === "" || (!Number.isNaN(Number(v)) && Math.abs(Number(v)) <= limit), t(limit === 90 ? "tenants.errors.latitude" : "tenants.errors.longitude"));
  const opt = (max: number) => z.string().trim().max(max);

  return z
    .object({
      name: z.string().trim().min(1, req).max(100),
      isActive: z.boolean(),
      plan: z.enum(["trial", "basic", "pro", "premium"]),
      trialEndsAt: z.string(),
      contactEmail: z.string().trim().email(t("tenants.errors.email")),
      customDomain: z.string().trim().refine((v) => v === "" || DOMAIN.test(v), t("tenants.errors.domain")),
      locale: z.string().trim().min(1, req),
      timezone: z.string().trim().refine(validTimezone, t("tenants.errors.timezone")),
      appTitle: z.object({ es: z.string().trim().min(1, req).max(150), en: opt(150), pt: opt(150), zh: opt(150) }),
      appDescription: z.object({ es: z.string().trim().min(1, req).max(500), en: opt(500), pt: opt(500), zh: opt(500) }),
      cloudName: z.string().trim().min(1, req),
      defaultWidth: z.number({ message: t("tenants.errors.number") }).int(t("tenants.errors.number")).min(16, t("tenants.errors.number")).max(4096, t("tenants.errors.number")),
      defaultExtension: z.string().trim().min(1, req),
      seo: z.object({
        keywords: opt(500), ogImageId: cloudId, appleIconId: cloudId, themeColorLight: hex, themeColorDark: hex,
        manifest: z.object({
          orientation: opt(30), display: opt(30), icon192Id: cloudId, icon512Id: cloudId, icon512MaskableId: cloudId,
          screenshotMobileId: cloudId, screenshotDesktopId: cloudId, themeColor: hex, backgroundColor: hex,
        }),
      }),
      structuredData: z.object({
        type: opt(60), latitude: coord(90), longitude: coord(180), locality: opt(100), region: opt(100), postalCode: opt(20),
        country: z.string().trim().refine((v) => v === "" || /^[A-Za-z]{2}$/.test(v), t("tenants.errors.country")),
        priceRange: opt(10), servesCuisine: opt(300), openingHours: opt(600), acceptsReservations: opt(10),
      }),
    })
    .superRefine((v, c) => {
      if (v.plan === "trial" && !v.trialEndsAt) c.addIssue({ code: "custom", path: ["trialEndsAt"], message: t("tenants.errors.trialEndsAt") });
      if (ctx.hadDomain && !v.customDomain) c.addIssue({ code: "custom", path: ["customDomain"], message: t("tenants.errors.domainLocked") });
      if (ctx.hadLatitude && !v.structuredData.latitude) c.addIssue({ code: "custom", path: ["structuredData", "latitude"], message: t("tenants.errors.coordLocked") });
      if (ctx.hadLongitude && !v.structuredData.longitude) c.addIssue({ code: "custom", path: ["structuredData", "longitude"], message: t("tenants.errors.coordLocked") });
    });
}
