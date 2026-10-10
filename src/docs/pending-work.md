# Pendientes del panel

## Recordatorios con disparador (no olvidar)
- [ ] **Estilizar las tablas y sumar opciones de estilo en Preferencias** (líneas divisorias, densidad, franjas,
      etc.). *Disparador: al empezar la Fase 3 (Products), cuando se arma la tabla definitiva.* Las opciones se
      guardan junto al resto de preferencias (`admin-prefs`) y se aplican con tokens/atributos en `themes.css`.
- [ ] **Selector de tenant escalable (SuperAdmin).** Hoy es un `<select>` con hasta 100 tenants: no sirve con
      miles. Reemplazar por un buscador (combobox) con búsqueda y paginación en el servidor. Requiere un
      parámetro de búsqueda en `GET /admin/tenants` (no existe hoy). *Disparador: ~50 tenants reales o antes de
      abrir el panel a más SuperAdmins.*
- [ ] **Offline / segundo plano.** La spec cubre solo: ediciones inline pendientes guardadas en IndexedDB (`idb`),
      sincronización al reconectar, registro de actividad persistido y un indicador por fila ("guardado local /
      guardado remoto"). NO cubre navegación offline completa. La barra de estado ya tiene lugar para
      "N cambios pendientes". Decidir si además se quiere persistir la caché de lectura (ver datos sin conexión).
      *Disparador: Fase 3.*

## Abiertos
- [ ] Probar `GET /api/v1/health/live` y, si responde 200, usarlo como `ENDPOINTS.probe` (más liviano que `/auth/me`).
- [ ] Fase 2b: crear tenant (plantilla completa, ver `api-contract-notes.md`), editar (slug de solo lectura),
      sección "Access" de usuarios (alta, desactivar, desbloquear). Probar solo con el tenant `test-panel`.
- [ ] Trampa de foco completa en `Popup` y `MobileDrawer`.
- [ ] Decidir `PATCH /settings` para que un TenantAdmin edite su propio tenant (no construido en la API).
- [ ] Port a la API de la validación de `business`/`ui` usando `tenant-config.schema.ts` (ver notas).
- [ ] Datos: `appDescription.zh` de sabor-urbano ("wilderness") y clave `seasonal` de eu-amo-coxinha.

## Cerrados
- [x] Indicador de conexión real (eventos + requests + sonda a la API).
- [x] Parpadeo del login al abrir con sesión iniciada.
- [x] El menú sigue el dedo al abrirlo desde el borde.
- [x] Abrir el menú móvil deslizando desde el borde izquierdo (umbrales en `ui.config.ts`). Probar en iOS/Android reales: el gesto de "volver" del navegador puede interferir.
- [x] Centro de notificaciones (campana + historial + filtro) en la barra de estado.
- [x] Contrato Zod del catálogo: ya estaba en el proyecto; analizado (ver `api-contract-notes.md`).
- [x] `themePalette`: son 25 valores (confirmado en `app-defaults.config.ts`).
- [x] `ui.languages.labels` es opcional en la práctica (el schema aplica `.catch`).
- [x] IP real detrás del rewrite de Vercel; paginación y códigos de error verificados contra producción.
- [x] Redirect post-login por rol; logout; menú con gestos; engranaje y paletas.

## Reglas del proyecto
- Avisos al usuario: siempre `notify.*`, nunca `toast` directo (ver `notifications-and-gestures.md`).
- Umbrales y límites de UI: solo en `src/core/config/ui.config.ts`.
- Rendimiento y Lighthouse siempre; animaciones livianas y desactivables.
- Gestos: menú y popups se cierran con "X" o deslizando (el menú también arrastrando desde fuera).
- Claro/oscuro/sistema y paletas desde Preferencias (en el menú); estilos centralizados en `themes.css`.
- Desarrollo apunta a la API de producción: probar solo en `test-panel`; nunca editar `sabor-urbano`.
- En desarrollo usar `http://localhost:5173`, no `127.0.0.1` (cookie `Secure`).
- Al cerrar cada fase: documentación actualizada y mensajes de commit con formato `tipo(alcance): resumen` + desglose,
  entregados solo cuando se confirma que la fase está terminada.
