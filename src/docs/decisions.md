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

## Bugs que enseñaron algo
- **Logout que "no hacía nada":** `qc.clear()` desenganchaba los observers; orden correcto: `setQueryData(me, null)` y luego `removeQueries`.
- **Arrastre del menú:** `domAnimation` no incluye `drag`; hace falta `domMax`.
- **Paginación:** el tipo inicial (`totalPages`) era una suposición; se corrigió con la respuesta real.
- **Parpadeo del login:** `HomeRedirect` redirigía a `/login` mientras `/auth/me` seguía cargando. Ahora espera el resultado.
- **Detección de desconexión que se "quedaba" en línea:** el indicador dependía solo de `navigator.onLine` (y su suscripción cambiaba en cada render). Se reemplazó por el monitor de conectividad.
- **Corte de Wi-Fi no detectado en el Mac:** el navegador hablaba con el proxy local de Vite, que sigue respondiendo (500) sin internet; con "cualquier respuesta = conectado" nunca fallaba. DevTools "Offline" sí lo detectaba porque bloquea también localhost.
- **Archivos del catálogo:** estaban en el proyecto desde el inicio y se pidieron de nuevo por no revisarlos. Revisar `/mnt/project` antes de pedir.
