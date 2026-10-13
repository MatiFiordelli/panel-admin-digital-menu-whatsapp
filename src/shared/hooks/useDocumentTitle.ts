// src/shared/hooks/useDocumentTitle.ts
import { useEffect } from "react";

/** Sets the browser tab / screen-reader page title: "<page> · Catálogo Admin". Every page must call it. */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = `${title} · Catálogo Admin`;
    return () => { document.title = previous; };
  }, [title]);
}
