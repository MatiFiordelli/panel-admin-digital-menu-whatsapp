// src/shared/components/ui/TagsInput.tsx
// A list of short values shown as removable chips. Enter or comma adds, Backspace on an empty box removes the last one.
import { useState } from "react";

interface Props {
  id: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  removeLabel: string; // accessible name of each chip's "x"
  label?: string; // accessible name of the whole group
  maxLength?: number;
}

export function TagsInput({ id, value, onChange, placeholder, removeLabel, label, maxLength = 40 }: Props) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const tag = raw.trim().slice(0, maxLength);
    setDraft("");
    if (!tag || value.some((v) => v.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
  };

  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5 rounded-md border border-ink/25 bg-surface p-1.5 focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-brand-text">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand-text">
          {tag}
          <button
            type="button" aria-label={`${removeLabel}: ${tag}`} title={`${removeLabel}: ${tag}`}
            onClick={() => onChange(value.filter((v) => v !== tag))}
            className="grid size-4 place-items-center rounded leading-none hover:bg-brand/20 active:scale-90"
          >×</button>
        </span>
      ))}
      <input
        id={id} value={draft} placeholder={value.length === 0 ? placeholder : undefined} autoComplete="off"
        onChange={(e) => (e.target.value.includes(",") ? add(e.target.value.replace(",", "")) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); add(draft); } // Enter adds the chip instead of submitting the form
          else if (e.key === "Backspace" && draft === "" && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => draft.trim() && add(draft)}
        className="min-w-28 flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-ink/65"
      />
    </div>
  );
}
