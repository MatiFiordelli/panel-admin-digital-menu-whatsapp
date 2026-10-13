// src/shared/components/ui/Tooltip.tsx
// Short explanation for a control. Appears on mouse hover (after a delay) and on KEYBOARD focus; never on touch taps.
// Rendered in a portal with fixed positioning, so tables and popups with overflow never clip it.
// Usage: <Tooltip label={t("tooltips.save")}><button>…</button></Tooltip>
import { cloneElement, useCallback, useEffect, useId, useRef, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";
import { UI_CONFIG } from "@/core/config/ui.config";

interface Props {
  label: string;
  children: ReactElement<{ "aria-describedby"?: string }>;
}

export function Tooltip({ label, children }: Props) {
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [pos, setPos] = useState<{ x: number; y: number; below: boolean } | null>(null);

  const open = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const r = wrapRef.current?.getBoundingClientRect();
      if (!r) return;
      const below = r.top < 56; // not enough room above: show it underneath
      setPos({
        x: Math.min(Math.max(r.left + r.width / 2, 100), window.innerWidth - 100), // keep it inside the screen
        y: below ? r.bottom + 8 : r.top - 8,
        below,
      });
    }, UI_CONFIG.TOOLTIPS.DELAY_MS);
  }, []);

  const close = useCallback(() => {
    window.clearTimeout(timer.current);
    setPos(null);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!pos) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
    };
  }, [pos, close]);

  return (
    <span
      ref={wrapRef}
      // disabled buttons swallow mouse events: let them pass through to this wrapper so the tooltip still works
      className="inline-flex has-[button:disabled]:cursor-not-allowed [&>button:disabled]:pointer-events-none"
      onMouseEnter={() => window.matchMedia("(hover: hover)").matches && open()}
      onMouseLeave={close}
      onFocus={(e) => (e.target as HTMLElement).matches(":focus-visible") && open()}
      onBlur={close}
    >
      {cloneElement(children, { "aria-describedby": pos ? id : children.props["aria-describedby"] })}
      {pos &&
        createPortal(
          <span
            role="tooltip" id={id}
            style={{ left: pos.x, top: pos.y, transform: pos.below ? "translate(-50%, 0)" : "translate(-50%, -100%)" }}
            className="pointer-events-none fixed z-[60] max-w-52 rounded-md bg-rail px-2.5 py-1.5 text-center text-xs leading-4 text-rail-fg shadow-lg"
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  );
}
