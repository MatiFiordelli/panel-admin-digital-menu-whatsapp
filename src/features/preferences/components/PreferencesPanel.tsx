// src/features/preferences/components/PreferencesPanel.tsx
import { useTranslation } from "react-i18next";
import { MODES, PALETTES, usePreferences } from "@/core/preferences/preferences-store";
import { LanguageSelector } from "@/shared/components/LanguageSelector";

const group = "mb-2 block text-xs font-semibold uppercase tracking-wide text-ink/60";
// Native radios (visually hidden) give correct keyboard behavior for free.
const segment =
  "block cursor-pointer rounded-md border border-ink/25 px-3 py-2 text-center text-sm transition-colors active:scale-[0.97] peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-brand-text";

export function PreferencesPanel() {
  const { t } = useTranslation();
  const { mode, palette, animations, setMode, setPalette, setAnimations } = usePreferences();
  const current = PALETTES.find((p) => p.id === palette) ?? PALETTES[0];

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className={group}>{t("prefs.mode")}</legend>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((m) => (
            <label key={m}>
              <input type="radio" name="mode" className="peer sr-only" checked={mode === m} onChange={() => setMode(m)} />
              <span className={segment}>{t(`prefs.${m}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="palette" className={group}>{t("prefs.palette")}</label>
        <div className="flex items-center gap-3">
          <span aria-hidden className="size-6 shrink-0 rounded-full ring-1 ring-ink/20 transition-colors" style={{ backgroundColor: current.swatch }} />
          <select
            id="palette" value={current.id} onChange={(e) => setPalette(e.target.value)}
            className="w-full rounded-md border border-ink/25 bg-surface px-2 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand-text"
          >
            {PALETTES.map((p) => <option key={p.id} value={p.id}>{t(`prefs.palettes.${p.id}`)}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium">{t("prefs.animations")}</div>
          <div className="text-xs text-ink/60">{t("prefs.animationsHint")}</div>
        </div>
        <button
          role="switch" aria-checked={animations} aria-label={t("prefs.animations")}
          onClick={() => setAnimations(!animations)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-text ${animations ? "bg-brand" : "bg-ink/30"}`}
        >
          <span className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform ${animations ? "translate-x-5" : ""}`} />
        </button>
      </div>

      <div>
        <label className={group}>{t("prefs.language")}</label>
        <LanguageSelector className="w-full" />
      </div>
    </div>
  );
}
