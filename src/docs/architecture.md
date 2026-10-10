# Arquitectura

## Stack
React 19 (sintaxis clásica) + Vite + TypeScript, Tailwind v4, shadcn/ui (Base UI, preset Nova),
TanStack Query, Zustand, React Router v6, React Hook Form + Zod, axios, i18next, sonner, framer-motion.
Gestor: bun (local), npm (Vercel). Prioridad permanente: rendimiento y Lighthouse.

## Estructura (por feature)
```
src/
  core/        config, lib (axios, queryClient), types, store (ui), i18n, preferences, motion, errors
  features/    auth, tenants, preferences  (cada una: components / hooks / services / utils)
  shared/      components (layout, ui), hooks
  pages/       páginas con carga diferida (lazy)
  styles/      themes.css (todo el tema vive acá)
src/components/ui/   componentes generados por shadcn (no editar a mano sin necesidad)
src/shared/components/ui/   primitivas propias (Popup)
```
Hay dos carpetas `ui`: la de shadcn (`src/components/ui`) y la propia (`src/shared/components/ui`).

## Acceso a la API y sesión
- El navegador siempre habla con su propio origen: `/api/v1/...`. En desarrollo lo atiende el proxy de Vite;
  en producción, el rewrite de `vercel.json`. Por eso la cookie `SameSite=Strict` funciona.
- Login: `POST /auth/login` devuelve `data.user` (mínimo). Después se consulta `GET /auth/me` (en `data`,
  usuario completo). La sesión es la cookie httpOnly; el JWT no se ve nunca en el front.
- `useAuth` expone `user, isLoading, isAuthenticated, isSuperAdmin, isTenantAdmin, hasRole, logout`.
- Interceptor de axios: 401 en login/me/logout es respuesta esperada; 401 en otra ruta limpia el usuario
  cacheado y `ProtectedRoute` redirige. 423 (cuenta bloqueada) nunca redirige: se muestra el mensaje del servidor.
- Roles: lista `ROLES` y `hasRole(...)`, nunca `if (role === "X")` suelto.
- Landing por rol: `getHomePath(role)` (SuperAdmin -> /tenants, TenantAdmin -> /dashboard).

## Contexto de tenant (SuperAdmin)
- El SuperAdmin "entra" a un tenant desde la tabla o el selector. El slug vive solo en memoria (`ui-store`):
  recargar vuelve a la vista global.
- El interceptor envía `x-tenant-id` **solo** si el usuario es SuperAdmin y hay tenant activo. Un TenantAdmin
  jamás lo envía (el backend toma su tenant del JWT).
- Las opciones del selector salen siempre de `GET /admin/tenants` (nunca texto libre): así el header lleva
  un slug legítimo y no aplica la colisión slug/customDomain.
- Al cambiar de tenant o hacer logout se descartan las queries que no sean `auth` ni `tenants`.

## Paginación
`normalizePagination` (en `core/types`) acepta números o strings y `pages` nulo. Se usa en todos los endpoints
(`/products` devuelve page/limit como string). Siempre se envían `page` y `limit` explícitos (máx. 100).

## Convenciones
- Comentarios en inglés; cada archivo empieza con su ruta como comentario.
- Endpoints y env vars solo en `core/config/api.config.ts`.
- Errores de formulario inline, nunca como toast. Toasts solo para confirmaciones y fallos de red.
- Textos siempre por i18n (es/en/pt/zh); los locales se cargan bajo demanda.
- Animaciones con framer-motion liviano: componentes `m.*` dentro de `LazyMotion`; se respetan
  `prefers-reduced-motion` y el interruptor de Preferencias.
