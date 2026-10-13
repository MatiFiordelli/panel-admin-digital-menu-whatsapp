// src/shared/components/ui/FormField.tsx
// Label + control + optional clear ("X") button + a message area that ALWAYS reserves its space
// (two lines), so showing/hiding an error or hint never moves the rest of the form.
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  id: string;
  label: string;
  /** Adds the red asterisk (and a screen-reader "required") next to the label. */
  required?: boolean;
  error?: string;
  hint?: string;
  /** Shows an "X" inside the control when it has a value. Give the control `pr-9` so text never runs under it. */
  clearable?: boolean;
  hasValue?: boolean;
  onClear?: () => void;
  /** Tailwind right offset of the X (use e.g. "right-9" next to a native date picker icon). */
  clearRight?: string;
  /** Vertical position of the X: centered for inputs, "top" for textareas. */
  clearAlign?: "center" | "top";
  children: ReactNode; // the control: give it id, aria-invalid and aria-describedby={`${id}-msg`}
}

export function FormField({ id, label, required, error, hint, clearable, hasValue, onClear, clearRight = "right-1.5", clearAlign = "center", children }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}
        {required && (
          <>
            <span aria-hidden className="ml-0.5 text-danger">*</span>
            <span className="sr-only"> ({t("common.required")})</span>
          </>
        )}
      </label>
      <div className="relative">
        {children}
        {clearable && hasValue && (
          <button
            type="button" tabIndex={-1} // pointer-only: keyboard users clear with select-all + delete
            aria-label={t("common.clear")} title={t("common.clear")}
            onMouseDown={(e) => e.preventDefault()} // keep focus in the input
            onClick={onClear}
            className={`absolute ${clearAlign === "top" ? "top-1.5" : "top-1/2 -translate-y-1/2"} ${clearRight} grid size-6 place-items-center rounded text-base leading-none text-ink/50 transition-colors hover:bg-ink/10 hover:text-ink active:scale-90`}
          >×</button>
        )}
      </div>
      {/* min-h-8 + leading-4 = two text-xs lines reserved */}
      <p id={`${id}-msg`} aria-live="polite" className={`mt-1 min-h-8 text-xs leading-4 ${error ? "text-danger" : "text-ink/70"}`}>{error ?? hint ?? ""}</p>
    </div>
  );
}
