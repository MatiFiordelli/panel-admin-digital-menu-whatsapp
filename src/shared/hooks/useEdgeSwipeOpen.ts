// src/shared/hooks/useEdgeSwipeOpen.ts
// Swipe from the left screen edge: the menu appears and follows the finger. On release past the thresholds in
// UI_CONFIG.GESTURES.DRAWER it opens; otherwise it slides back. Passive document listeners: no invisible layer
// that could steal taps from the page.
import { useEffect } from "react";
import { UI_CONFIG } from "@/core/config/ui.config";
import { DRAWER_WIDTH, drawerX, moveDrawer } from "@/shared/components/layout/drawer-motion";

export function useEdgeSwipeOpen(enabled: boolean, onOpen: () => void) {
  useEffect(() => {
    if (!enabled) return;
    const { EDGE_WIDTH, OPEN_DISTANCE, OPEN_VELOCITY, OPEN_FLICK_MIN } = UI_CONFIG.GESTURES.DRAWER;
    const small = window.matchMedia("(max-width: 767px)"); // the drawer only exists below md
    let tracking = false, decided = false, moved = false;
    let x0 = 0, y0 = 0, t0 = 0;

    const reset = () => {
      if (moved) moveDrawer(-DRAWER_WIDTH); // slide back
      tracking = decided = moved = false;
    };

    const start = (e: TouchEvent) => {
      const t = e.touches[0];
      tracking = small.matches && e.touches.length === 1 && t.clientX <= EDGE_WIDTH;
      decided = moved = false;
      if (tracking) { x0 = t.clientX; y0 = t.clientY; t0 = performance.now(); }
    };

    const move = (e: TouchEvent) => {
      if (!tracking) return;
      const t = e.touches[0];
      const dx = t.clientX - x0, dy = t.clientY - y0;
      if (!decided) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return; // not enough movement to tell the direction yet
        decided = true;
        if (Math.abs(dy) > Math.abs(dx) || dx < 0) { tracking = false; return; } // vertical scroll or wrong way
      }
      moved = true;
      drawerX.set(Math.max(-DRAWER_WIDTH, Math.min(0, -DRAWER_WIDTH + dx))); // the menu follows the finger
    };

    const end = (e: TouchEvent) => {
      if (!tracking || !moved) { tracking = decided = moved = false; return; }
      const t = e.changedTouches[0];
      const dx = t.clientX - x0;
      const vx = (dx / Math.max(1, performance.now() - t0)) * 1000;
      const pass = dx > OPEN_DISTANCE || (vx > OPEN_VELOCITY && dx > OPEN_FLICK_MIN);
      tracking = decided = moved = false;
      if (pass) onOpen(); // drawer's effect finishes the slide from where the finger left it
      else moveDrawer(-DRAWER_WIDTH);
    };

    document.addEventListener("touchstart", start, { passive: true });
    document.addEventListener("touchmove", move, { passive: true });
    document.addEventListener("touchend", end, { passive: true });
    document.addEventListener("touchcancel", reset, { passive: true });
    return () => {
      document.removeEventListener("touchstart", start);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
      document.removeEventListener("touchcancel", reset);
    };
  }, [enabled, onOpen]);
}
