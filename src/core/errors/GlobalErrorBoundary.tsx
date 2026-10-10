// src/core/errors/GlobalErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from "react";
import i18n from "@/core/i18n";

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="grid min-h-dvh place-items-center bg-paper p-6 text-ink">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold">{i18n.t("errors.boundaryTitle")}</h1>
          <p className="mt-2 text-sm text-ink/70">{i18n.t("errors.boundaryBody")}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {i18n.t("errors.reload")}
          </button>
        </div>
      </div>
    );
  }
}
