// src/shared/components/layout/MobileDrawer.tsx
// Slide-in menu for small screens, always mounted and positioned by `drawerX`.
// Closes by: dragging the menu left, dragging LEFT ANYWHERE outside it (the panel follows the finger),
// tapping the scrim, or Escape. Opens with the hamburger button or by swiping from the left edge
// (see useEdgeSwipeOpen). Thresholds live in src/core/config/ui.config.ts.
import { useEffect, useRef, type ReactNode } from "react";
import { m, useTransform } from "framer-motion";
import { UI_CONFIG } from "@/core/config/ui.config";
import { DRAWER_WIDTH, drawerX, moveDrawer } from "@/shared/components/layout/drawer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}

const { CLOSE_DISTANCE, CLOSE_VELOCITY } = UI_CONFIG.GESTURES.DRAWER;

export function MobileDrawer({ open, onClose, label, children }: Props) {
  const panelRef = useRef<HTMLElement>(null);
  const scrimOpacity = useTransform(drawerX, [-DRAWER_WIDTH, 0], [0, 1]);

  // State -> position. (While the edge swipe is in progress `open` is still false and the gesture moves drawerX itself.)
  useEffect(() => { moveDrawer(open ? 0 : -DRAWER_WIDTH); }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const shouldClose = (offsetX: number, velocityX: number) => offsetX < -CLOSE_DISTANCE || velocityX < -CLOSE_VELOCITY;

  return (
    <>
      <m.div
        className="fixed inset-0 z-20 bg-black/40 md:hidden"
        style={{ opacity: scrimOpacity, pointerEvents: open ? "auto" : "none", touchAction: "pan-y" }}
        onClick={onClose}
        // Dragging outside the menu: the panel follows the finger, then closes or springs back.
        onPan={(_, info) => drawerX.set(Math.max(-DRAWER_WIDTH, Math.min(0, info.offset.x)))}
        onPanEnd={(_, info) => (shouldClose(info.offset.x, info.velocity.x) ? onClose() : moveDrawer(0))}
        aria-hidden
      />
      <m.aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal={open}
        aria-label={label}
        inert={!open} // hidden menu: not focusable, ignored by screen readers
        className="fixed inset-y-0 left-0 z-30 flex flex-col bg-rail p-3 outline-none md:hidden"
        style={{ x: drawerX, width: DRAWER_WIDTH, touchAction: "pan-y" }}
        drag="x"
        dragConstraints={{ left: -DRAWER_WIDTH, right: 0 }}
        dragElastic={{ left: 0.05, right: 0 }}
        dragMomentum={false}
        onDragEnd={(_, info) => (shouldClose(info.offset.x, info.velocity.x) ? onClose() : moveDrawer(0))}
      >
        {children}
      </m.aside>
    </>
  );
}
