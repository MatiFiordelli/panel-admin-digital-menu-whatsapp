// src/shared/components/layout/Breadcrumbs.tsx
// Clickable path ("Tenants › Mi Negocio › Edit"). Steps backed by a page are links; dynamic names (set by the
// page through useBreadcrumbLabel) and the last step are plain text.
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CRUMBS } from "@/shared/components/layout/navigation";
import { useCrumbLabels } from "@/shared/components/layout/breadcrumb-store";

const Chevron = () => (
  <svg aria-hidden viewBox="0 0 24 24" className="size-4 text-ink/40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export function Breadcrumbs() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const labels = useCrumbLabels((s) => s.labels);
  const parts = pathname.split("/").filter(Boolean);

  const crumbs = parts
    .map((seg, i) => {
      const to = "/" + parts.slice(0, i + 1).join("/");
      const key = CRUMBS[seg];
      return key ? { text: t(key), to, link: true } : labels[to] ? { text: labels[to], to, link: false } : null;
    })
    .filter((c): c is { text: string; to: string; link: boolean } => c !== null);
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label={t("nav.breadcrumb")}>
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.to} className="flex items-center gap-1">
              {i > 0 && <Chevron />}
              {last ? (
                <span aria-current="page" className="rounded-md bg-brand/10 px-2.5 py-1 font-semibold text-brand-text">{c.text}</span>
              ) : c.link ? (
                <Link to={c.to} className="rounded-md px-2.5 py-1 font-medium text-ink/70 transition-colors hover:bg-ink/10 hover:text-ink active:scale-95 focus-visible:outline-2 focus-visible:outline-brand-text">{c.text}</Link>
              ) : (
                <span className="px-2.5 py-1 font-medium text-ink/70">{c.text}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
