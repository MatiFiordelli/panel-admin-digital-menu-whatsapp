// src/shared/components/layout/breadcrumb-store.ts
// Lets a page name a dynamic path segment ("/tenants/<id>" -> the tenant's name) for the breadcrumbs.
import { useEffect } from "react";
import { create } from "zustand";

const useCrumbLabels = create<{ labels: Record<string, string> }>(() => ({ labels: {} }));
export const useCrumbLabel = (path: string) => useCrumbLabels((s) => s.labels[path]);

/** Call from a page: names `path` while the page is mounted. */
export function useBreadcrumbLabel(path: string, label: string | undefined) {
  useEffect(() => {
    if (!label) return;
    useCrumbLabels.setState((s) => ({ labels: { ...s.labels, [path]: label } }));
    return () => useCrumbLabels.setState((s) => {
      const { [path]: _removed, ...rest } = s.labels;
      return { labels: rest };
    });
  }, [path, label]);
}
export { useCrumbLabels };
