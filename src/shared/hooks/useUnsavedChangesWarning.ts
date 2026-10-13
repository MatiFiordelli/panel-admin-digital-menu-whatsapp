// src/shared/hooks/useUnsavedChangesWarning.ts
import { useEffect } from "react";

/** Asks the browser to confirm closing/reloading the tab while a form has unsaved changes.
 *  (In-app navigation is not intercepted: that needs a data router. Forms also confirm on their Cancel button.) */
export function useUnsavedChangesWarning(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);
}
