# Registro de decisiones

| # | Decisión | Motivo |
|---|---|---|
| 1 | Cookie/dominio: proxy same-origin (Vite en dev, rewrite en Vercel) | `SameSite=Strict` no viaja entre sitios distintos |
| 2 | Fuente del sistema, sin fuentes web | Cero requests de fuentes: mejor LCP/CLS |
| 3 | Locales i18n cargados bajo demanda | Solo viaja el idioma activo en el primer pintado |
| 4 | Tras login se vuelve a pedir `/auth/me` | `login` devuelve un usuario mínimo |
| 5 | Roles como lista + `hasRole` | Agregar un rol de empleado cuesta una línea |
| 6 | Tenant activo solo en memoria | Recargar vuelve a la vista global; evita escribir en un tenant por olvido |
| 7 | Selector de tenant solo desde `GET /admin/tenants` | Neutraliza la colisión slug/customDomain en `x-tenant-id` (escala: ver pendientes) |
| 8 | Orden y búsqueda de tenants/usuarios en el cliente | La API no documenta parámetros; hay pocos registros |
| 9 | Plantilla completa para crear tenants, tienda cerrada por defecto | Evita tenants que rompan el catálogo |
| 10 | Tema con tokens CSS + `data-theme` + clase `dark`, valores en un solo archivo | Agregar/quitar paletas sin tocar componentes |
| 11 | Un único `Popup` para todos los popups | Gestos y cierre uniformes |
| 12 | `LazyMotion` con `domMax` diferido | `drag`/`pan` solo existen en `domMax`; fuera del bundle inicial |
| 13 | Cada paleta define el look completo (fondo, tarjetas, menú, texto, marca) | Con solo la marca el cambio casi no se notaba |
| 14 | Preferencias en el menú; popup global en el layout | Cerrar el menú móvil no debe desmontar el popup |
| 15 | Barra de estado inferior (conexión + hora de última actualización) | Funciona igual en móvil y escritorio, no satura la barra superior, y tiene lugar para "pendientes de sincronizar" |
| 16 | Todo aviso pasa por `notify()` (toast + historial en localStorage) | El historial no se pierde y no hay toasts "huérfanos" |
| 17 | Campana con contador en la barra de estado; historial en un `Popup` | Reutiliza los gestos y el cierre uniforme |
| 18 | Umbrales de gestos y límites en `ui.config.ts` | Ajustar sensibilidad sin tocar componentes |
| 19 | Abrir el menú con gesto desde el borde con oyentes en `document` | Una capa invisible en el borde robaría toques al contenido |
| 20 | Botón de la página actual con su propio estilo (sin mezclar `bg-*`) | Dos clases `bg-*` en conflicto dejaban el número blanco sobre blanco |
| 21 | Conectividad = eventos + resultado de requests + sonda periódica a la API | `navigator.onLine` no detecta Wi-Fi sin internet y a veces no emite eventos |
| 22 | El menú es un único valor de posición compartido (`drawerX`), siempre montado | Permite que el gesto del borde lo mueva en vivo y que cerrar/abrir usen el mismo camino |
| 23 | Nunca decidir una redirección antes de que `/auth/me` responda (pantalla neutra) | Evita mostrar el login a quien ya tiene sesión |
| 24 | La sonda de conectividad se omite si hay requests exitosos, solo con pestaña visible, y sondea rápido solo estando offline | Costo casi nulo para el servidor en uso normal |
| 25 | Para la sonda, 5xx = fallo (no "alcanzable") | El proxy local de Vite responde 500 aun sin internet |
| 26 | Barras de scroll finas, discretas y con espacio reservado (`scrollbar-gutter: stable`) | Sin saltos de layout al aparecer/desaparecer el scroll |
| 27 | El menú móvil tiene botón "X" además de los gestos | Descubribilidad: no todos saben que se arrastra |
| 28 | El formulario de creación exige nombre, dirección, teléfono y WhatsApp reales | El schema del catálogo rechaza vacíos y rompería la config del tenant |
| 29 | `customDomain` se omite si está vacío | Es único y disperso: `""`/`null` colisionaría entre tenants |
| 30 | Formularios con errores en línea, API 400/409 mapeados al campo, aviso al salir con cambios | Cumple la spec sin depender de un router de datos |
| 31 | Convenciones de formulario fijas: placeholder, espacio reservado para mensajes, "X", confirmación al guardar | Uniformidad y cero saltos de layout (ver `forms.md`) |
| 32 | Migrar a router de datos (`createBrowserRouter`) | `useBlocker` permite pedir confirmación en navegación interna y botón atrás |
| 33 | Zona horaria como `<select>` agrupado por región | El `datalist` no se abría como lista y era poco claro |
| 34 | Breadcrumbs clicables con chevrons y página actual resaltada | Navegación hacia atrás y mejor aspecto |
| 35 | El tenant se crea con título y descripción públicos (4 idiomas); SEO y datos estructurados se completan al editar | Evita un tenant "sin título"; SEO depende de imágenes que aún no hay |
| 36 | Las notificaciones guardan clave + parámetros, no texto | El historial se muestra siempre en el idioma actual |
| 37 | Validación reactiva configurable en `ui.config.ts` | Errores en el momento en que ocurren; cambio de política en una línea |
| 38 | Inputs que limpian lo escrito/pegado según el tipo de dato | Imposible dejar letras en teléfono/WhatsApp; slug y dominio normalizados |
| 39 | `ApiError` con propiedades declaradas explícitamente (sin parameter properties) | El proyecto usa `erasableSyntaxOnly`; evita reescribirlo en cada entrega |
| 40 | La edición envía solo las hojas que cambiaron (diff profundo) | La API fusiona en profundidad; no se pisan datos que el formulario no toca |
| 41 | Un dato opcional ya guardado se puede cambiar pero no vaciar | La API no elimina claves; `""`/`null` en `customDomain` rompería el índice único |
| 42 | Secciones largas (SEO, datos estructurados) plegables; se abren solas si tienen errores | Formulario manejable sin esconder errores |
| 43 | Breadcrumbs con nombres dinámicos aportados por la página | "Tenants › Mi Negocio › Editar" sin acoplar el layout a las páginas |
| 44 | Asterisco de obligatorio + nota en cada formulario | Se ve de un vistazo qué falta completar |
| 45 | Tooltips accesibles (hover con demora y foco de teclado, no en táctil) en botones de acción | Aclaran «Guardar» vs «Guardar y volver», «Entrar», etc. |
| 46 | Tipos de negocio de schema.org (17) y «cocina» solo para gastronomía, como chips | El catálogo no es solo comida; el arreglo se ve elemento por elemento |
| 47 | «Gestionar» renombrado a «Entrar» + mensaje contextual en el inicio | Se confundía con «Editar» |
| 48 | La confirmación nombra los campos exactos que cambiaron | Antes agrupaba (p. ej. «Título y descripción») |
| 49 | Accesibilidad como regla del proyecto, con lista de verificación (`accessibility.md`) | Cumplir WCAG AA y usar la app solo con teclado |
| 50 | Trampa de foco apilable + devolución del foco + foco inicial en el panel | Un Enter accidental no confirma nada; diálogos sobre diálogos funcionan |
| 51 | Cursores definidos globalmente en `themes.css` | Tailwind v4 ya no pone `pointer` en botones |
| 52 | Campos de color con selector nativo + hexadecimal | Más amigable y validable |
| 53 | Rol fijo TenantAdmin al crear usuarios y sin baja definitiva | Un SuperAdmin no lleva tenant; desactivar es reversible |
| 54 | El diseño móvil llega hasta 1023 px (`lg`), centralizado en `UI_CONFIG.LAYOUT.MOBILE_QUERY` | Con menú lateral fijo, un ancho de 768–1023 px dejaba poco espacio al contenido |
| 55 | País como lista con nombres localizados por el navegador | Evita errores de tipeo y no requiere traducciones manuales |
| 56 | Repetir contraseña al crear usuarios (se autocompleta al generar) | Una contraseña mal tipeada no tiene recuperación hoy |
| 57 | Sin requisito de símbolos en la contraseña | Se prioriza la longitud (NIST 800-63B); las generadas son largas y aleatorias |
| 58 | El bloqueo por intentos fallidos NO cierra sesiones abiertas | Evita que alguien saque a otra persona de su sesión fallando su contraseña a propósito |

## Bugs que enseñaron algo
- **Logout que "no hacía nada":** `qc.clear()` desenganchaba los observers; orden correcto: `setQueryData(me, null)` y luego `removeQueries`.
- **Arrastre del menú:** `domAnimation` no incluye `drag`; hace falta `domMax`.
- **Paginación:** el tipo inicial (`totalPages`) era una suposición; se corrigió con la respuesta real.
- **Pestañas de idioma que se trababan:** el mismo `<input>` cambiaba de nombre registrado (`appTitle.es` → `appTitle.en`) al cambiar de pestaña, algo que React Hook Form no soporta. Se arregló con `key` por idioma.
- **Parpadeo del login:** `HomeRedirect` redirigía a `/login` mientras `/auth/me` seguía cargando. Ahora espera el resultado.
- **Detección de desconexión que se "quedaba" en línea:** el indicador dependía solo de `navigator.onLine` (y su suscripción cambiaba en cada render). Se reemplazó por el monitor de conectividad.
- **Corte de Wi-Fi no detectado en el Mac:** el navegador hablaba con el proxy local de Vite, que sigue respondiendo (500) sin internet; con "cualquier respuesta = conectado" nunca fallaba. DevTools "Offline" sí lo detectaba porque bloquea también localhost.
- **Archivos del catálogo:** estaban en el proyecto desde el inicio y se pidieron de nuevo por no revisarlos. Revisar `/mnt/project` antes de pedir.
