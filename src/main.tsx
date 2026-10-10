// src/main.tsx
import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { LazyMotion, MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import "@/index.css";
import { initI18n } from "@/core/i18n";
import { initPreferences } from "@/core/preferences/apply";
import { initConnectivity } from "@/core/connectivity/connectivity-store";
import { usePreferences } from "@/core/preferences/preferences-store";
import { queryClient } from "@/core/lib/queryClient";
import { GlobalErrorBoundary } from "@/core/errors/GlobalErrorBoundary";
import App from "@/App";

initPreferences(); // theme/palette/motion applied before React renders
initConnectivity(); // online/offline detection (events + request results + periodic probe)

/** "Animations off" in Preferences -> reducedMotion "always"; otherwise follow the OS setting. */
function MotionRoot({ children }: { children: ReactNode }) {
  const animations = usePreferences((s) => s.animations);
  return (
    <MotionConfig reducedMotion={animations ? "user" : "always"}>
      {/* Features load lazily (domMax = includes drag), keeping them out of the initial bundle. */}
      <LazyMotion features={() => import("@/core/motion/features").then((f) => f.default)} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}

// Wait for the active language bundle so the first paint is already translated.
initI18n().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <GlobalErrorBoundary>
        <MotionRoot>
          <QueryClientProvider client={queryClient}>
            <App />
            <Toaster richColors closeButton position="top-right" />
          </QueryClientProvider>
        </MotionRoot>
      </GlobalErrorBoundary>
    </StrictMode>,
  );
});
