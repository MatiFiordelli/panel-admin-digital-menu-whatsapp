## Pendientes del panel
- [x] IP real detrás del rewrite de Vercel: verificado en producción (log de la API
      mostró la IP pública real). Cerrado, sin seguimiento.
- [ ] Redirect post-login: SuperAdmin → /tenants, TenantAdmin → /dashboard
      (se hace en Fase 2, junto con la ruta; helper getHomePath(role)).
- [ ] Tenant switcher: poblar SIEMPRE desde GET /admin/tenants, nunca texto libre
      (evita colisión slug/customDomain en x-tenant-id).
- [ ] Dev: usar http://localhost:5173, no 127.0.0.1 (cookie Secure).
- [ ] Fase 3: alinear tokens de color propios con los de shadcn (Nova).