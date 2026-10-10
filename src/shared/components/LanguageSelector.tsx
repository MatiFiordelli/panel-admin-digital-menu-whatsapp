// src/shared/components/LanguageSelector.tsx
import { useTranslation } from "react-i18next";
import { LANGUAGES, setLanguage, type LanguageId } from "@/core/i18n";

export function LanguageSelector({ className = "" }: { className?: string }) {
  const { t, i18n } = useTranslation();
  return (
    <select
      aria-label={t("nav.language")}
      value={i18n.language}
      onChange={(e) => void setLanguage(e.target.value as LanguageId)}
      className={`rounded-md border border-ink/25 bg-surface px-2 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand ${className}`}
    >
      {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
    </select>
  );
}
