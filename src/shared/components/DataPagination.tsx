// src/shared/components/DataPagination.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Pagination } from "@/core/types";

interface Props {
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  limitOptions?: number[];
  disabled?: boolean; // e.g. while rows have unsaved edits (Phase 3)
}

// Base has NO background; idle/active each set exactly one, so classes never conflict.
const base =
  "min-w-9 rounded-md border px-2 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-brand-text disabled:cursor-not-allowed";
const idle = `${base} border-ink/20 bg-surface hover:bg-ink/5 disabled:opacity-40`;
// The current page stays fully readable even when the whole control is disabled.
const active = `${base} border-brand bg-brand text-white disabled:opacity-100`;

export function DataPagination({ pagination, onPageChange, onLimitChange, limitOptions = [10, 25, 50, 100], disabled }: Props) {
  const { t } = useTranslation();
  const { page, pages, limit, total } = pagination;
  const [goTo, setGoTo] = useState("");

  // Window of up to 5 numbered pages around the current one.
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const numbers = Array.from({ length: Math.min(5, pages) }, (_, i) => start + i);

  const submitGo = () => {
    const n = Number(goTo);
    if (Number.isInteger(n) && n >= 1 && n <= pages) onPageChange(n);
    setGoTo("");
  };

  return (
    <nav aria-label={t("pagination.label")} className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-ink/70">{t("pagination.total", { count: total })}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <button className={idle} disabled={disabled || page <= 1} onClick={() => onPageChange(1)} aria-label={t("pagination.first")}>«</button>
        <button className={idle} disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)} aria-label={t("pagination.prev")}>‹</button>
        {numbers.map((n) => (
          <button
            key={n} disabled={disabled} onClick={() => onPageChange(n)}
            aria-current={n === page ? "page" : undefined}
            className={n === page ? active : idle}
          >
            {n}
          </button>
        ))}
        <button className={idle} disabled={disabled || page >= pages} onClick={() => onPageChange(page + 1)} aria-label={t("pagination.next")}>›</button>
        <button className={idle} disabled={disabled || page >= pages} onClick={() => onPageChange(pages)} aria-label={t("pagination.last")}>»</button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number" min={1} max={pages} value={goTo} disabled={disabled}
          onChange={(e) => setGoTo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitGo()}
          aria-label={t("pagination.goToPage")}
          className="w-16 rounded-md border border-ink/20 bg-surface px-2 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-brand-text disabled:opacity-40"
        />
        <button className={idle} disabled={disabled || !goTo} onClick={submitGo}>{t("pagination.go")}</button>
        <select
          value={limit} disabled={disabled} onChange={(e) => onLimitChange(Number(e.target.value))}
          aria-label={t("pagination.perPage")} className={idle}
        >
          {limitOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </nav>
  );
}
