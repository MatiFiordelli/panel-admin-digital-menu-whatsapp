// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "@/index.css";
import { initI18n } from "@/core/i18n";
import { queryClient } from "@/core/lib/queryClient";
import { GlobalErrorBoundary } from "@/core/errors/GlobalErrorBoundary";
import App from "@/App";

// Wait for the active language bundle so the first paint is already translated.
initI18n().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <GlobalErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster richColors closeButton position="top-right" />
        </QueryClientProvider>
      </GlobalErrorBoundary>
    </StrictMode>,
  );
});
