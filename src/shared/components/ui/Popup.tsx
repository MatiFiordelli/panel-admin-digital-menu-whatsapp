// src/shared/components/ui/Popup.tsx
// The ONE popup primitive for the whole app. Every popup must use it so the gestures stay uniform:
//   mobile  -> bottom sheet; drag the header/handle down to close
//   desktop -> centered dialog
//   both    -> "X" button, Escape, tap on the scrim; scroll locked behind; focus moved inside.
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useDragControls } from "framer-motion";
import { useTranslation } from "react-i18next";
import { UI_CONFIG } from "@/core/config/ui.config";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

// Thresholds live in src/core/config/ui.config.ts
const { CLOSE_DISTANCE, CLOSE_VELOCITY } = UI_CONFIG.GESTURES.POPUP;

export function Popup({ open, onClose, title, children }: Props) {
  const { t } = useTranslation();
  const mobile = useMediaQuery("(max-width: 767px)");
  const controls = useDragControls();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

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

  const motionProps = mobile
    ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, transition: { type: "tween" as const, duration: 0.25, ease: "easeOut" as const } }
    : { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.96 }, transition: { duration: 0.15 } };

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          key="scrim"
          className="fixed inset-0 z-50 bg-black/45"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          onClick={onClose} aria-hidden
        />
      )}
      {open && (
        <m.div
          key="panel"
          ref={panelRef}
          tabIndex={-1}
          role="dialog" aria-modal="true" aria-labelledby={titleId}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl bg-surface text-ink shadow-xl outline-none md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-[80dvh] md:w-[28rem] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl"
          {...motionProps}
          drag={mobile ? "y" : false}
          dragControls={controls}
          dragListener={false} // only the header starts a drag, so scrolling the content never closes it
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.7 }}
          dragSnapToOrigin
          onDragEnd={(_, info) => {
            if (info.offset.y > CLOSE_DISTANCE || info.velocity.y > CLOSE_VELOCITY) onClose();
          }}
        >
          <div
            onPointerDown={(e) => mobile && controls.start(e)}
            className="select-none px-4 pb-2 pt-2 md:pt-4"
            style={{ touchAction: "none" }}
          >
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-ink/20 md:hidden" />
            <div className="flex items-center justify-between gap-3">
              <h2 id={titleId} className="text-lg font-semibold tracking-tight">{title}</h2>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onClose}
                aria-label={t("common.close")}
                className="grid size-8 place-items-center rounded-md text-lg leading-none transition-transform hover:bg-ink/10 active:scale-90 focus-visible:outline-2 focus-visible:outline-brand-text"
              >×</button>
            </div>
          </div>
          <div className="overflow-y-auto overscroll-contain px-4 pb-6 pt-2">{children}</div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
