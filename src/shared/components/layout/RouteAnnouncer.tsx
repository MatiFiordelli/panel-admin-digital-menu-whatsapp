// src/shared/components/layout/RouteAnnouncer.tsx
// A single-page app does not reload, so screen readers get no "new page" signal. This announces the new page title.
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export function RouteAnnouncer() {
  const { pathname } = useLocation();
  const [message, setMessage] = useState("");
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const id = window.setTimeout(() => setMessage(document.title), 150); // wait for the page to set its title
    return () => window.clearTimeout(id);
  }, [pathname]);

  return <div role="status" aria-live="polite" className="sr-only">{message}</div>;
}
