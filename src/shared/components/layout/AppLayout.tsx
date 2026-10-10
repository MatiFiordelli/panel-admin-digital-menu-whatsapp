// src/shared/components/layout/AppLayout.tsx
import { AnimatePresence, m } from "framer-motion";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUiStore } from "@/core/store/ui-store";
import { PreferencesButton } from "@/features/preferences/components/PreferencesButton";
import { PreferencesPopup } from "@/features/preferences/components/PreferencesPopup";
import { TenantSwitcher } from "@/shared/components/layout/TenantSwitcher";
import { MobileDrawer } from "@/shared/components/layout/MobileDrawer";
import { StatusBar } from "@/shared/components/layout/StatusBar";
import { useEdgeSwipeOpen } from "@/shared/hooks/useEdgeSwipeOpen";
import { CRUMBS, NAV_ITEMS } from "@/shared/components/layout/navigation";

/** Shared by the static desktop sidebar and the mobile drawer. */
function SidebarContent({ onNavigate, onClose }: { onNavigate?: () => void; onClose?: () => void }) {
  const { t } = useTranslation();
  const { user, hasRole, logout } = useAuth();
  const items = NAV_ITEMS.filter((i) => hasRole(...i.roles));

  const link = ({ isActive }: { isActive: boolean }) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition-colors active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-rail-fg ${
      isActive ? "bg-rail-fg/15 text-rail-fg" : "text-rail-fg/70 hover:bg-rail-fg/10 hover:text-rail-fg"
    }`;

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="font-semibold tracking-tight text-rail-fg">Catálogo Admin</span>
        {onClose && (
          <button
            onClick={onClose} aria-label={t("common.close")}
            className="grid size-8 place-items-center rounded-md text-lg leading-none text-rail-fg/70 transition-colors hover:bg-rail-fg/10 hover:text-rail-fg active:scale-90 focus-visible:outline-2 focus-visible:outline-rail-fg"
          >×</button>
        )}
      </div>
      <nav aria-label={t("nav.menu")} className="mt-4 flex-1 space-y-1">
        {items.map((i) => (
          <NavLink key={i.to} to={i.to} className={link} onClick={onNavigate}>{t(i.labelKey)}</NavLink>
        ))}
      </nav>
      <div className="pb-2"><PreferencesButton variant="rail" onOpen={onNavigate} /></div>
      <div className="border-t border-rail-fg/15 px-3 pt-3 text-xs text-rail-fg/60">
        <div className="truncate">{user?.email}</div>
        <div>{user?.role}</div>
        <button
          onClick={logout}
          className="mt-2 rounded-md border border-rail-fg/30 px-3 py-1.5 text-sm text-rail-fg transition-colors hover:bg-rail-fg/10 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-rail-fg"
        >
          {t("nav.logout")}
        </button>
      </div>
    </>
  );
}

export function AppLayout() {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen, prefsOpen, activeTenantSlug, setActiveTenant } = useUiStore();
  const { pathname } = useLocation();
  const crumb = CRUMBS[pathname.split("/")[1] ?? ""];
  const closeDrawer = () => setSidebarOpen(false);
  // Swipe right from the left edge opens the menu (thresholds in ui.config.ts).
  useEdgeSwipeOpen(!sidebarOpen && !prefsOpen, () => setSidebarOpen(true));

  return (
    <div className="min-h-dvh bg-paper text-ink md:grid md:grid-cols-[14rem_1fr]">
      {/* Desktop: static column, stays in view while the page scrolls */}
      <aside className="hidden flex-col bg-rail p-3 md:sticky md:top-0 md:flex md:h-dvh md:self-start">
        <SidebarContent />
      </aside>

      {/* Mobile: swipeable drawer */}
      <MobileDrawer open={sidebarOpen} onClose={closeDrawer} label={t("nav.menu")}>
        <SidebarContent onNavigate={closeDrawer} onClose={closeDrawer} />
      </MobileDrawer>

      <PreferencesPopup />

      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/15 bg-surface px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)} aria-label={t("nav.menu")} aria-expanded={sidebarOpen}
              className="rounded-md border border-ink/25 px-2.5 py-1 text-sm transition-transform active:scale-90 md:hidden focus-visible:outline-2 focus-visible:outline-brand-text"
            >☰</button>
            {crumb && <span className="text-sm font-medium text-ink/70">{t(crumb)}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AnimatePresence initial={false}>
              {activeTenantSlug && (
                <m.span
                  key="managing"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2 rounded-md bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand-text"
                >
                  {t("tenants.managing", { slug: activeTenantSlug })}
                  <button onClick={() => setActiveTenant(null)} className="underline">{t("tenants.exit")}</button>
                </m.span>
              )}
            </AnimatePresence>
            <TenantSwitcher />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6"><Outlet /></main>
        <StatusBar />
      </div>
    </div>
  );
}
