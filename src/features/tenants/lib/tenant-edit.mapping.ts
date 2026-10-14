// src/features/tenants/lib/tenant-edit.mapping.ts
// tenant (API) -> form values -> API shape -> minimal PATCH body.
import type { TFunction } from "i18next";
import { deepDiff, leafPaths } from "@/core/lib/deep-diff";
import type { Tenant } from "@/core/types";

export const LANGS = ["es", "en", "pt", "zh"] as const;
export type Lang = (typeof LANGS)[number];

export interface TenantEditValues {
  name: string;
  isActive: boolean;
  plan: "trial" | "basic" | "pro" | "premium";
  trialEndsAt: string; // yyyy-mm-dd
  contactEmail: string;
  customDomain: string;
  locale: string;
  timezone: string;
  appTitle: Record<Lang, string>;
  appDescription: Record<Lang, string>;
  cloudName: string;
  defaultWidth: number;
  defaultExtension: string;
  seo: {
    keywords: string; ogImageId: string; appleIconId: string; themeColorLight: string; themeColorDark: string;
    manifest: {
      orientation: string; display: string; icon192Id: string; icon512Id: string; icon512MaskableId: string;
      screenshotMobileId: string; screenshotDesktopId: string; themeColor: string; backgroundColor: string;
    };
  };
  structuredData: {
    type: string; latitude: string; longitude: string; locality: string; region: string; postalCode: string;
    country: string; priceRange: string; servesCuisine: string; openingHours: string; acceptsReservations: string;
  };
}

type Rec = Record<string, unknown>;
const rec = (v: unknown): Rec => (typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Rec) : {});
const str = (v: unknown): string => (v === null || v === undefined ? "" : String(v));
const list = (v: unknown, sep: string): string => (Array.isArray(v) ? v.map(String).join(sep) : "");
const splitList = (v: string, sep: RegExp): string[] => v.split(sep).map((x) => x.trim()).filter(Boolean);

/** Languages the tenant offers (es is always first: it is the only required one). */
export function tenantLanguages(tn: Tenant): Lang[] {
  const supported = rec(tn.ui?.languages).supported;
  const ids = Array.isArray(supported) ? supported.map((l) => str(rec(l).id)) : [];
  return ["es", ...LANGS.filter((l) => l !== "es" && ids.includes(l))];
}

export function toFormValues(tn: Tenant): TenantEditValues {
  const m = tn.metadata;
  const seo = rec(m.seo);
  const man = rec(seo.manifest);
  const sd = rec(m.structuredData);
  const cloud = rec(rec(tn.infra).cloudinary);
  const pick = (o: Rec | undefined, l: Lang) => str(o?.[l]);
  return {
    name: str(tn.business?.companyInfo?.name),
    isActive: !!m.isActive,
    plan: m.plan,
    trialEndsAt: m.trialEndsAt ? str(m.trialEndsAt).slice(0, 10) : "",
    contactEmail: str(m.contactEmail),
    customDomain: str(m.customDomain),
    locale: str(m.locale),
    timezone: str(m.timezone),
    appTitle: { es: pick(m.appTitle, "es"), en: pick(m.appTitle, "en"), pt: pick(m.appTitle, "pt"), zh: pick(m.appTitle, "zh") },
    appDescription: { es: pick(m.appDescription, "es"), en: pick(m.appDescription, "en"), pt: pick(m.appDescription, "pt"), zh: pick(m.appDescription, "zh") },
    cloudName: str(cloud.cloudName),
    defaultWidth: Number(cloud.defaultWidth) || 512,
    defaultExtension: str(cloud.defaultExtension) || "webp",
    seo: {
      keywords: str(seo.keywords), ogImageId: str(seo.ogImageId), appleIconId: str(seo.appleIconId),
      themeColorLight: str(seo.themeColorLight), themeColorDark: str(seo.themeColorDark),
      manifest: {
        orientation: str(man.orientation), display: str(man.display), icon192Id: str(man.icon192Id), icon512Id: str(man.icon512Id),
        icon512MaskableId: str(man.icon512MaskableId), screenshotMobileId: str(man.screenshotMobileId),
        screenshotDesktopId: str(man.screenshotDesktopId), themeColor: str(man.themeColor), backgroundColor: str(man.backgroundColor),
      },
    },
    structuredData: {
      type: str(sd.type), latitude: str(sd.latitude), longitude: str(sd.longitude), locality: str(sd.locality),
      region: str(sd.region), postalCode: str(sd.postalCode), country: str(sd.country), priceRange: str(sd.priceRange),
      servesCuisine: list(sd.servesCuisine, ", "), openingHours: list(sd.openingHours, "\n"),
      acceptsReservations: sd.acceptsReservations === undefined ? "false" : str(sd.acceptsReservations),
    },
  };
}

/** The slice of the tenant document this form manages, in the API's own shape. */
function toApi(v: TenantEditValues) {
  const num = (s: string) => (s.trim() === "" ? undefined : Number(s));
  return {
    metadata: {
      isActive: v.isActive, plan: v.plan, trialEndsAt: v.trialEndsAt, contactEmail: v.contactEmail,
      customDomain: v.customDomain, locale: v.locale, timezone: v.timezone,
      appTitle: v.appTitle, appDescription: v.appDescription,
      seo: v.seo, // manifest.id / start_url are not managed here, so they are never sent
      structuredData: {
        type: v.structuredData.type, latitude: num(v.structuredData.latitude), longitude: num(v.structuredData.longitude),
        locality: v.structuredData.locality, region: v.structuredData.region, postalCode: v.structuredData.postalCode,
        country: v.structuredData.country.toUpperCase(), priceRange: v.structuredData.priceRange,
        servesCuisine: splitList(v.structuredData.servesCuisine, /,/), openingHours: splitList(v.structuredData.openingHours, /\n/),
        acceptsReservations: v.structuredData.acceptsReservations,
      },
    },
    business: { companyInfo: { name: v.name } },
    infra: { cloudinary: { cloudName: v.cloudName, defaultWidth: v.defaultWidth, defaultExtension: v.defaultExtension } },
  };
}

/**
 * Minimal PATCH body (only what changed versus the saved tenant) plus the dotted paths that REALLY changed.
 * `paths` is computed before the full-map substitution below, so the confirmation can name the exact fields.
 */
export function buildPatch(original: Tenant, current: TenantEditValues): { patch: Record<string, unknown>; paths: string[] } {
  const diff = deepDiff(toApi(toFormValues(original)), toApi(current)) as { metadata?: Rec };
  const paths = leafPaths(diff);
  const meta = diff.metadata;
  if (meta) {
    if ("trialEndsAt" in meta) {
      const d = str(meta.trialEndsAt);
      meta.trialEndsAt = d ? new Date(`${d}T23:59:59`).toISOString() : null;
    }
    // The API documents appTitle/appDescription as full {es,en,pt,zh} maps: send the whole map when any language changed.
    if (meta.appTitle) meta.appTitle = current.appTitle;
    if (meta.appDescription) meta.appDescription = current.appDescription;
  }
  return { patch: diff, paths };
}

const FIELD_LABELS: Record<string, string> = {
  "metadata.isActive": "tenants.edit.statusLabel",
  "metadata.plan": "tenants.fields.plan",
  "metadata.trialEndsAt": "tenants.fields.trialEndsAt",
  "metadata.contactEmail": "tenants.fields.contactEmail",
  "metadata.customDomain": "tenants.fields.customDomain",
  "metadata.locale": "tenants.fields.locale",
  "metadata.timezone": "tenants.fields.timezone",
  "business.companyInfo.name": "tenants.fields.name",
  "metadata.seo.keywords": "tenants.fields.keywords",
  "metadata.seo.ogImageId": "tenants.fields.ogImageId",
  "metadata.seo.appleIconId": "tenants.fields.appleIconId",
  "metadata.seo.themeColorLight": "tenants.fields.themeColorLight",
  "metadata.seo.themeColorDark": "tenants.fields.themeColorDark",
  "metadata.seo.manifest.orientation": "tenants.fields.orientation",
  "metadata.seo.manifest.display": "tenants.fields.display",
  "metadata.seo.manifest.icon192Id": "tenants.fields.icon192Id",
  "metadata.seo.manifest.icon512Id": "tenants.fields.icon512Id",
  "metadata.seo.manifest.icon512MaskableId": "tenants.fields.icon512MaskableId",
  "metadata.seo.manifest.screenshotMobileId": "tenants.fields.screenshotMobileId",
  "metadata.seo.manifest.screenshotDesktopId": "tenants.fields.screenshotDesktopId",
  "metadata.seo.manifest.themeColor": "tenants.fields.themeColor",
  "metadata.seo.manifest.backgroundColor": "tenants.fields.backgroundColor",
  "metadata.structuredData.type": "tenants.fields.businessType",
  "metadata.structuredData.latitude": "tenants.fields.latitude",
  "metadata.structuredData.longitude": "tenants.fields.longitude",
  "metadata.structuredData.locality": "tenants.fields.locality",
  "metadata.structuredData.region": "tenants.fields.region",
  "metadata.structuredData.postalCode": "tenants.fields.postalCode",
  "metadata.structuredData.country": "tenants.fields.country",
  "metadata.structuredData.priceRange": "tenants.fields.priceRange",
  "metadata.structuredData.servesCuisine": "tenants.fields.servesCuisine",
  "metadata.structuredData.openingHours": "tenants.fields.openingHours",
  "metadata.structuredData.acceptsReservations": "tenants.fields.acceptsReservations",
  "infra.cloudinary.cloudName": "tenants.fields.cloudName",
  "infra.cloudinary.defaultWidth": "tenants.fields.defaultWidth",
  "infra.cloudinary.defaultExtension": "tenants.fields.defaultExtension",
};

/** Human names of the exact fields that changed, e.g. "Título (EN)", "Cocina / especialidades". */
export function changedLabels(paths: string[], t: TFunction): string[] {
  const out = new Set<string>();
  for (const p of paths) {
    const m = /^metadata\.(appTitle|appDescription)\.(\w+)$/.exec(p);
    if (m) {
      out.add(`${t(m[1] === "appTitle" ? "tenants.fields.appTitle" : "tenants.fields.appDescription")} (${m[2].toUpperCase()})`);
      continue;
    }
    out.add(FIELD_LABELS[p] ? t(FIELD_LABELS[p]) : p);
  }
  return [...out];
}
