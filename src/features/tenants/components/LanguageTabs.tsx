// src/features/tenants/components/LanguageTabs.tsx
// Tab group for per-language fields. Tabs shown = the tenant's supported languages (es always first, the only required one).
// Keyboard: Left/Right (and Home/End) move between tabs; only the selected tab is in the Tab order (roving tabindex).
import type { KeyboardEvent } from "react";
import { LANGUAGES } from "@/core/i18n";

interface Props {
  languages: string[];
  active: string;
  onChange: (lang: string) => void;
  errorLangs: string[]; // tabs holding an invalid field get a red dot
  label: string;
}

const nameOf = (id: string) => LANGUAGES.find((l) => l.id === id)?.label ?? id;

export function LanguageTabs({ languages, active, onChange, errorLangs, label }: Props) {
  const move = (to: string) => {
    onChange(to);
    document.getElementById(`lang-tab-${to}`)?.focus();
  };
  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const last = languages.length - 1;
    const target =
      e.key === "ArrowRight" ? languages[index === last ? 0 : index + 1]
      : e.key === "ArrowLeft" ? languages[index === 0 ? last : index - 1]
      : e.key === "Home" ? languages[0]
      : e.key === "End" ? languages[last]
      : null;
    if (target) { e.preventDefault(); move(target); }
  };

  return (
    <div role="tablist" aria-label={label} className="mb-3 flex flex-wrap gap-1.5">
      {languages.map((l, i) => {
        const selected = l === active;
        return (
          <button
            key={l} type="button" role="tab" id={`lang-tab-${l}`} title={nameOf(l)} aria-label={nameOf(l)}
            aria-selected={selected} aria-controls="lang-panel" tabIndex={selected ? 0 : -1}
            onClick={() => onChange(l)} onKeyDown={(e) => onKeyDown(e, i)}
            className={`rounded-md border px-3 py-1 text-xs font-semibold uppercase transition-colors active:scale-95 focus-visible:outline-2 focus-visible:outline-brand-text ${
              selected ? "border-brand bg-brand text-white" : "border-ink/25 hover:bg-ink/5"
            }`}
          >
            <span aria-hidden>{l}</span>
            {errorLangs.includes(l) && <span aria-hidden className="ml-1.5 inline-block size-2 rounded-full bg-red-500 align-middle" />}
          </button>
        );
      })}
    </div>
  );
}
