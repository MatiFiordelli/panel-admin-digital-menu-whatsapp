// src/shared/components/layout/AppLayout.tsx
// Phase 1 shell: topbar only. Sidebar + breadcrumbs + tenant switcher arrive with Phase 2.
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LanguageSelector } from "@/shared/components/LanguageSelector";

export function AppLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="flex items-center justify-between gap-3 bg-ink px-4 py-3 text-paper">
        <span className="font-semibold tracking-tight">Catálogo Admin</span>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-paper/70 sm:inline">{user?.email}</span>
          <LanguageSelector />
          <button
            onClick={logout}
            className="rounded-md border border-paper/30 px-3 py-1.5 text-sm hover:bg-paper/10 focus-visible:outline-2 focus-visible:outline-paper"
          >
            {t("nav.logout")}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6"><Outlet /></main>
    </div>
  );
}
