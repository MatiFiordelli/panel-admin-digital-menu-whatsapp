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

## 🔔 RECORDATORIOS PARA EL USUARIO (la IA debe recordárselos al cerrar la 2b y antes de empezar la Fase 3)
- [ ] **Decirle al otro Claude (el de la API)** que despliegue lo acordado (409 con `code`/`field` y validación de `business`/`ui`) y que **avise** cuando esté desplegado. Todavía NO lo hizo.
- [ ] Cuando avise: **probar desde el panel** (1) crear un tenant con un slug repetido en `test-panel` y ver que el 409 marque el campo exacto, y (2) editar `test-panel` para confirmar que la validación nueva no rompió nada.
- [ ] Corregir a mano `ui.branding.seasonal` de eu-amo-coxinha (`$rename` de `seasonal` a `active`, con backup) y la palabra «wilderness» en `appDescription.zh` de sabor-urbano.

## Abiertos
- [ ] **Decisión del dueño — cerrar sesiones:** el bloqueo no las cierra (ver `users-and-roles.md`). Opciones: dejarlo así / botón «Cerrar sesiones» para el SuperAdmin (requiere `sessionsValidAfter` en la API) / cerrar al bloquear (no recomendado).
- [ ] Revisión de las traducciones por hablantes nativos de portugués y chino (ver `i18n.md`) y correr `scripts/check-i18n.mjs` antes de cada commit con textos nuevos.
- [ ] Política de contraseñas: evaluar mínimo de 10–12 caracteres en el panel y bloqueo de contraseñas comunes (la API exige hoy 8).
- [ ] **Centro de ayuda (Fase 6, pulido):** una sección «Ayuda» con buscador. Propuesta: UNA sola sección con artículos cortos en formato pregunta/respuesta (las FAQ son
      un formato de contenido, no algo aparte), organizados por tema (tenants, usuarios, productos, ajustes, atajos), con búsqueda sobre título y texto, en los 4 idiomas, y
      enlaces «?» desde formularios complejos. Contenido guardado en archivos de traducción para que el buscador respete el idioma.
- [ ] Extender los tooltips al resto de la app (menú, cerrar «×», engranaje, filtros) a medida que se construyan las pantallas.
- [ ] **Renombrar el slug de un tenant (futuro, opcional):** técnicamente posible pero NO es un cambio de formulario: el slug se copia como `tenantId` en cada Producto, Categoría
      y Usuario, viaja en el JWT de los TenantAdmin y se usa como carpeta de Cloudinary. Requeriría una operación deliberada en la API (script/endpoint que actualice todo y cierre sesiones). No planificado.
- [ ] **Eliminar un tenant: NO está en el plan.** La API no tiene ruta de borrado de tenants; la alternativa actual es suspender (`isActive: false`), que lo deja fuera del catálogo.
      Borrar de verdad requeriría un endpoint con cascada (productos, categorías, usuarios) o que se niegue si tiene datos. Decisión pendiente del dueño.
- [ ] Usuarios: cambiar la contraseña de un usuario existente (la API lo permite con `PATCH /users/:id { password }`).
- [ ] Accesibilidad: probar con lectores de pantalla reales y medir contrastes con axe/Lighthouse (ver `accessibility.md`).
- [ ] Subir imágenes desde el panel (`POST /uploads/image`) para los ID de SEO/PWA (hoy se escriben a mano).
- [x] (HECHO en la entrega de accesibilidad: trampa de foco, devolución de foco, flechas en pestañas, saltar al contenido) Navegación por teclado y trampa de foco: Tab/Shift+Tab confinados dentro de `Popup`, `ConfirmDialog` y `MobileDrawer`
      mientras estén abiertos; devolver el foco al elemento que los abrió al cerrarlos; foco inicial en el primer control útil (no solo en el panel);
      orden de tabulación coherente; flechas en selectores segmentados; "saltar al contenido". Hoy: foco al abrir + Escape.
- [ ] API (propuesto, falta OK): que el 409 de creación traiga `code` (`DUPLICATE_SLUG` / `DUPLICATE_CUSTOM_DOMAIN`) y `field` (`slug` / `customDomain`).
      El panel ya los usa si llegan; sin ellos infiere el campo del mensaje.
- [ ] API (propuesto, falta OK): validación mínima de `business`/`ui` en el servidor basada en `tenant-config.schema.ts` del catálogo (no vacíos en
      nombre, dirección, teléfono y WhatsApp; formato de horarios `HH:MM - HH:MM`; secciones de `ui` presentes), tolerante a claves extra y sin romper tenants existentes.
- [ ] Barra de acciones fija (sticky) en formularios: hoy están al final del formulario.
- [ ] Probar `GET /api/v1/health/live` y, si responde 200, usarlo como `ENDPOINTS.probe` (más liviano que `/auth/me`).
- [ ] Fase 2b: crear tenant (plantilla completa, ver `api-contract-notes.md`), editar (slug de solo lectura),
      sección "Access" de usuarios (alta, desactivar, desbloquear). Probar solo con el tenant `test-panel`.
- [ ] Decidir `PATCH /settings` para que un TenantAdmin edite su propio tenant (no construido en la API).
- [ ] Port a la API de la validación de `business`/`ui` usando `tenant-config.schema.ts` (ver notas).
- [ ] Datos: `appDescription.zh` de sabor-urbano ("wilderness") y clave `seasonal` de eu-amo-coxinha.

## Cerrados
- [x] Arreglos en el PATCH: la API reemplaza el arreglo completo (confirmado por código y probado en `test-panel`).
- [x] `customDomain` no se puede quitar por PATCH (índice único + sin `$unset`): el panel no lo ofrece. En la práctica es obligatorio para que el catálogo muestre al tenant.
- [x] API: 409 con `code`/`field` y validación de `business`/`ui` (chequeo contra los 4 tenants: 4 de 4 correctos). Falta que el otro Claude avise del despliegue.
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
- TypeScript con `erasableSyntaxOnly`: nada de *parameter properties* (`constructor(public x)`), `enum` ni `namespace`; declarar las propiedades de las
  clases de forma explícita (ver `ApiError` en `core/lib/axios.ts`). Cualquier archivo nuevo debe respetarlo.
- Avisos con `notify.*("clave", params)`; nunca texto ya traducido (ver `notifications-and-gestures.md`).
- Avisos al usuario: siempre `notify.*`, nunca `toast` directo (ver `notifications-and-gestures.md`).
- Umbrales y límites de UI: solo en `src/core/config/ui.config.ts`.
- Rendimiento y Lighthouse siempre; animaciones livianas y desactivables.
- Gestos: menú y popups se cierran con "X" o deslizando (el menú también arrastrando desde fuera).
- Claro/oscuro/sistema y paletas desde Preferencias (en el menú); estilos centralizados en `themes.css`.
- Desarrollo apunta a la API de producción: probar solo en `test-panel`; nunca editar `sabor-urbano`.
- En desarrollo usar `http://localhost:5173`, no `127.0.0.1` (cookie `Secure`).
- Al cerrar cada fase: documentación actualizada y mensajes de commit con formato `tipo(alcance): resumen` + desglose,
  entregados solo cuando se confirma que la fase está terminada.
