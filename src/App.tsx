// src/App.tsx
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { AppLayout } from "@/shared/components/layout/AppLayout";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getHomePath } from "@/features/auth/utils/getHomePath";
import { SplashScreen } from "@/shared/components/SplashScreen";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const TenantsPage = lazy(() => import("@/pages/TenantsPage"));

/** "/" and unknown paths land on the role's home (this also avoids redirect loops). */
function HomeRedirect() {
  const { user, isLoading } = useAuth();
  // Wait for /auth/me: deciding earlier sent logged-in users to /login for a moment.
  if (isLoading) return <SplashScreen />;
  return <Navigate to={user ? getHomePath(user.role) : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route element={<ProtectedRoute roles={["SuperAdmin"]} />}>
                <Route path="/tenants" element={<TenantsPage />} />
                {/* Phase 2b: /tenants/new, /tenants/:id/edit */}
              </Route>
              {/* Phase 3+: /products, /categories, /settings */}
            </Route>
          </Route>
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
