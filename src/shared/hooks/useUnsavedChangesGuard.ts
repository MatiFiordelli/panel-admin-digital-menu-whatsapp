// src/shared/hooks/useUnsavedChangesGuard.ts
// Blocks leaving a dirty form: in-app navigation (links, menu, browser back) via the data router's useBlocker,
// and closing/reloading the tab via beforeunload. Render <UnsavedChangesDialog blocker={blocker} /> next to the form.
import { useRef } from "react";
import { useBlocker } from "react-router-dom";
import { useUnsavedChangesWarning } from "@/shared/hooks/useUnsavedChangesWarning";

export function useUnsavedChangesGuard(dirty: boolean) {
  const bypass = useRef(false);
  useUnsavedChangesWarning(dirty);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && !bypass.current && currentLocation.pathname !== nextLocation.pathname,
  );
  /** Call right before the form's own navigation after a successful save. */
  const allowNextNavigation = () => { bypass.current = true; };
  return { blocker, allowNextNavigation };
}
