// src/core/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { STORAGE_KEYS } from "@/core/config/api.config";

export const LANGUAGES = [
  { id: "es", label: "Español" },
  { id: "en", label: "English" },
  { id: "pt", label: "Português" },
  { id: "zh", label: "中文" },
] as const;
export type LanguageId = (typeof LANGUAGES)[number]["id"];

// Locales are lazy-loaded: only the active language ships on first paint.
const loaders: Record<LanguageId, () => Promise<{ default: Record<string, unknown> }>> = {
  es: () => import("./locales/es.json"),
  en: () => import("./locales/en.json"),
  pt: () => import("./locales/pt.json"),
  zh: () => import("./locales/zh.json"),
};

const isLang = (v: string | null): v is LanguageId => LANGUAGES.some((l) => l.id === v);

function detectLanguage(): LanguageId {
  const saved = localStorage.getItem(STORAGE_KEYS.language);
  if (isLang(saved)) return saved;
  const nav = navigator.language.slice(0, 2);
  return isLang(nav) ? nav : "es";
}

async function ensureBundle(lng: LanguageId) {
  if (!i18n.hasResourceBundle(lng, "translation")) {
    const mod = await loaders[lng]();
    i18n.addResourceBundle(lng, "translation", mod.default);
  }
}

export async function setLanguage(lng: LanguageId) {
  await ensureBundle(lng);
  await i18n.changeLanguage(lng);
  localStorage.setItem(STORAGE_KEYS.language, lng);
  document.documentElement.lang = lng;
}

export async function initI18n() {
  const lng = detectLanguage();
  await i18n.use(initReactI18next).init({
    lng,
    fallbackLng: false,
    resources: {},
    interpolation: { escapeValue: false },
  });
  await ensureBundle(lng);
  await i18n.changeLanguage(lng);
  document.documentElement.lang = lng;
}

export default i18n;
