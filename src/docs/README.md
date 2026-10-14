# Documentación del panel admin

Regla de trabajo: **cada fase actualiza su doc antes de cerrarse** (junto con el commit).

| Doc | Qué contiene |
|---|---|
| `architecture.md` | Stack, estructura, flujo de sesión, contexto de tenant, convenciones |
| `preferences-and-theming.md` | Claro/oscuro/sistema, paletas, animaciones, barra de estado, cómo agregar o quitar un tema |
| `api-contract-notes.md` | Formas reales de la API, lo que exige el schema del catálogo, plantilla de creación de tenants |
| `notifications-and-gestures.md` | `notify()`, historial y campana, umbrales de gestos (`ui.config.ts`) |
| `accessibility.md` | Reglas y lista de verificación de accesibilidad, límites conocidos |
| `forms.md` | Convenciones de todos los formularios |
| `tenants.md` | Lista y creación de tenants: plantilla inicial, campos obligatorios, errores, supuestos |
| `users-and-roles.md` | Roles, quién crea cuentas, autoría en productos, sesiones, contraseñas |
| `i18n.md` | Cómo se traduce, qué herramientas conviene usar y script de verificación |
| `decisions.md` | Registro de decisiones y bugs que enseñaron algo |
| `pending-work.md` | Recordatorios con disparador, pendientes, reglas del proyecto, convención de commits |

Estado: Fase 1 cerrada · Fase 2a (shell + lista) probada · Preferencias, gestos y barra de estado en prueba ·
Fase 2b (crear/editar tenant + usuarios) pendiente · Fases 3 a 6 sin empezar.
