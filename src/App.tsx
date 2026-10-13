// src/App.tsx
// A DATA router (createBrowserRouter) is required by useBlocker, which guards forms with unsaved changes.
import { lazy, Suspense, type ReactElement } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { AppLayout } from "@/shared/components/layout/AppLayout";
import { SplashScreen } from "@/shared/components/SplashScreen";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getHomePath } from "@/features/auth/utils/getHomePath";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const TenantsPage = lazy(() => import("@/pages/TenantsPage"));
const TenantCreatePage = lazy(() => import("@/pages/TenantCreatePage"));
const TenantEditPage = lazy(() => import("@/pages/TenantEditPage"));

const page = (el: ReactElement) => <Suspense fallback={null}>{el}</Suspense>;

/** "/" and unknown paths land on the role's home (this also avoids redirect loops). */
function HomeRedirect() {
  const { user, isLoading } = useAuth();
  // Wait for /auth/me: deciding earlier sent logged-in users to /login for a moment.
  if (isLoading) return <SplashScreen />;
  return <Navigate to={user ? getHomePath(user.role) : "/login"} replace />;
}

const router = createBrowserRouter([
  { path: "/login", element: page(<LoginPage />) },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: page(<DashboardPage />) },
          {
            element: <ProtectedRoute roles={["SuperAdmin"]} />,
            children: [
              { path: "/tenants", element: page(<TenantsPage />) },
              { path: "/tenants/new", element: page(<TenantCreatePage />) },
              { path: "/tenants/:id/edit", element: page(<TenantEditPage />) },
            ],
          },
          // Phase 3+: /products, /categories, /settings
        ],
      },
    ],
  },
  { path: "*", element: <HomeRedirect /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
