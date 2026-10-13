// src/features/tenants/config/tenant-template.ts
// Initial configuration for a NEW tenant: the structure of a real, working tenant (sabor-urbano) with no business data.
// The shop starts CLOSED with delivery disabled, so nothing can be ordered until the business is configured in Settings.
// The catalog's Zod schema (tenant-config.schema.ts) requires non-empty companyInfo.name/address/phone and whatsapp.number,
// so those four always come from the creation form; every ui section must exist as an object, so all are included here.

export const LOCALES = [
  { id: "es-AR", label: "Español (Argentina)", language: "es", timezone: "America/Argentina/Buenos_Aires" },
  { id: "pt-BR", label: "Português (Brasil)", language: "pt", timezone: "America/Sao_Paulo" },
  { id: "en-US", label: "English (US)", language: "en", timezone: "America/New_York" },
  { id: "zh-CN", label: "中文 (中国)", language: "zh", timezone: "Asia/Shanghai" },
] as const;
export type LocaleId = (typeof LOCALES)[number]["id"];

const WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

const CURRENCY_MAP = {
  "es-AR": { locale: "es-AR", code: "ARS", symbol: "$", fractionDigits: 0 },
  "pt-BR": { locale: "pt-BR", code: "BRL", symbol: "R$", fractionDigits: 2 },
  "en-US": { locale: "en-US", code: "USD", symbol: "$", fractionDigits: 2 },
  "zh-CN": { locale: "zh-CN", code: "CNY", symbol: "¥", fractionDigits: 2 },
};

export interface TemplateInput {
  name: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  contactEmail: string;
  locale: LocaleId;
  cloudName: string;
  defaultWidth: number;
  defaultExtension: string;
}

export function buildTenantConfig(i: TemplateInput) {
  const language = LOCALES.find((l) => l.id === i.locale)?.language ?? "es";

  const business = {
    companyInfo: {
      name: i.name,
      address: i.address,
      phone: i.phone,
      email: i.contactEmail,
      // Same placeholders the catalog uses by default and real tenants start with.
      social: {
        instagram: "https://www.instagram.com/",
        facebook: "https://www.facebook.com/",
        x: "https://www.x.com/",
        tiktok: "https://www.tiktok.com/",
        threads: "https://www.threads.com/",
      },
    },
    companyHours: Object.fromEntries(WEEK.map((d) => [d, "closed"])),
    whatsapp: { number: i.whatsappNumber, orderLanguage: language },
    storeOperations: {
      delivery: { enabled: false, estimatedTime: "45 - 50", minAdvance: 45 },
      shopFlow: { manualOpenOverride: null }, // null = follow the schedule (all closed)
    },
    currency: { default: i.locale, map: CURRENCY_MAP },
    cartConfig: { expirationMode: "auto", expirationTime: 24 },
  };

  const ui = {
    branding: {
      // Placeholders until real logos are uploaded (Settings).
      logoIdDark: "default_id_logo_dark",
      logoIdLight: "default_id_logo_light",
      footerLogoIdDark: "default_id_footer_logo_dark",
      footerLogoIdLight: "default_id_footer_logo_light",
      themePalette: "classic",
      seasonal: { active: false, themePalette: null, logoIdDark: null, logoIdLight: null, footerLogoIdDark: null, footerLogoIdLight: null },
    },
    languages: {
      default: language,
      supported: [
        { id: "es", label: "Español", flag: "🇦🇷" },
        { id: "en", label: "English", flag: "🇺🇸" },
        { id: "pt", label: "Português", flag: "🇧🇷" },
        { id: "zh", label: "中文", flag: "🇨🇳" },
      ],
    },
    navbar: { mode: "autohide", showDevThemeSwitcher: false },
    notifications: { position: "bottom-right", duration: 3000, visibleToasts: 5, activeSkin: "highVisibility" },
    search: { maxLength: 100, maxRecent: 5, clearInputOnMicStart: true, voiceSearchEnabled: true },
    filters: { defaultExpanded: false },
    pagination: { persistLastVisitedPage: false, maxPagesShown: 3, limitOptions: [10, 25, 50] },
    categories: { allCategoriesItemImageId: "all-categories_fjckfd" },
    catalog: {
      viewModes: ["grid", "list", "compact"],
      defaultViewMode: "grid",
      sortDirectionReset: true,
      persistCatalogFilters: false,
      persistCatalogViewMode: true,
    },
    lastOrders: { enabled: true, maxOrders: 4, strategy: "add_to_cart" },
    recentPurchases: {
      strategy: "weighted_score",
      maxVisibleItems: 12,
      maxStoredItems: 50,
      maxTrendingProducts: 12,
      weights: { frequency: 0.6, totalQuantity: 0.4 },
      dayparts: {
        morning: { start: 6, end: 12 },
        afternoon: { start: 12, end: 18 },
        evening: { start: 18, end: 23 },
        lateNight: { start: 23, end: 6 },
      },
      daypartTags: ["morning", "afternoon", "evening", "late_night", "all_day"],
    },
    floatingWhatsApp: { enabled: true },
    footer: { showDevCredits: true },
  };

  const infra = { cloudinary: { cloudName: i.cloudName, defaultWidth: i.defaultWidth, defaultExtension: i.defaultExtension } };

  return { business, ui, infra };
}

/** Public title/description per language (metadata.appTitle / appDescription), same wording the catalog uses by default. */
export function buildTenantContent(name: string) {
  return {
    appTitle: {
      es: `${name} | Menú Digital y Delivery`,
      en: `${name} | Digital Menu & Delivery`,
      pt: `${name} | Cardápio Digital e Delivery`,
      zh: `${name} | 数字化菜单与外卖`,
    },
    appDescription: {
      es: "Explorá nuestro menú digital, personalizá tus platos y hacé tu pedido online de forma rápida y sencilla.",
      en: "Explore our digital menu, customize your dishes and place your order online quickly and easily.",
      pt: "Explore nosso cardápio digital, personalize seus pratos e faça seu pedido online de forma rápida e fácil.",
      zh: "探索我们的数字化菜单，定制您的菜品，快速轻松地在线下单。",
    },
  };
}
