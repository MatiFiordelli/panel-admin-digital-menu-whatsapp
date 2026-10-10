// src/shared/components/layout/drawer-motion.ts
// The menu's horizontal position (-WIDTH = hidden, 0 = open). Shared so that BOTH the drawer itself and the
// edge-swipe gesture can drive it: the menu then follows the finger while you drag from the screen edge.
import { animate, motionValue } from "framer-motion";
import { UI_CONFIG } from "@/core/config/ui.config";

export const DRAWER_WIDTH = UI_CONFIG.GESTURES.DRAWER.WIDTH;
export const drawerX = motionValue(-DRAWER_WIDTH);

/** Slide the menu to `target`. Jumps instantly when animations are off or the OS asks for reduced motion. */
export function moveDrawer(target: number) {
  const reduce =
    document.documentElement.dataset.motion === "off" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) drawerX.set(target);
  else animate(drawerX, target, { type: "tween", duration: 0.22, ease: "easeOut" });
}
