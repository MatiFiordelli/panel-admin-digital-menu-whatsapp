# Notas del contrato de la API (verificadas contra producción y contra el schema del catálogo)

Base: `https://crud-base-api.vercel.app/api/v1`. Fuente de verdad: el comportamiento real.

## Sesión
- `POST /auth/login` -> `data.user = { id, email, role, tenantId }`. `GET /auth/me` -> en `data`: usuario completo.
- 401 credenciales; 423 cuenta bloqueada (`ACCOUNT_LOCKED`, el mensaje trae los minutos); 429 límite por IP (8/5 min).
  El backend ve la IP real del usuario detrás del rewrite de Vercel (verificado).

## Paginación
`/admin/tenants` y `/users`: `{ page, limit, total, pages }` numéricos, defaults 1/10, máximo 100.
`/products`: page/limit pueden venir como string. `/categories`: sin paginación.
No hay parámetros de orden ni búsqueda en `/admin/tenants` ni `/users`.

## Errores
`{ success:false, message, code? }`; `code` no es universal. En 400 de validación `message` es un array JSON dentro de un string.

## Forma de un tenant
`{ id, tenantId, metadata, business, ui, infra }` (identificador `id`, no `_id`). La ruta admin devuelve todo lo de la pública más `contactEmail` y `plan`.

## Lo que exige el schema del catálogo (`tenant-config.schema.ts`) — leído del código
- **Obligatorios y NO vacíos** (sin `.catch`): `business.companyInfo.name`, `.address`, `.phone` y `business.whatsapp.number`
  (`z.string().min(1)`). Un `""` hace fallar todo `business` y, como `BusinessSchema` no tiene `.catch`, falla la config completa del tenant.
  -> El formulario de creación debe pedir estos 4 datos reales (o un valor no vacío); no se puede dejar para después.
- `metadata`: `isActive`, `version`, `locale`, `timezone`, `createdAt`, `updatedAt` obligatorios y `customDomain` string o null (no puede faltar).
  Si `metadata` no valida, el catálogo usa un fallback silencioso (slug `fallback-tenant`). Enviar siempre `version: "1.0.0"`.
  Un tenant sin `customDomain` no se resuelve nunca en el catálogo (se resuelve por dominio).
- Horarios: `"HH:MM - HH:MM"` con **dos dígitos** (regex `^\d{2}:\d{2} - \d{2}:\d{2}$`) o `closed | holiday | inquire`.
- `themePalette`: **25 valores**: classic, gourmet, emerald, sunset, purple, bakery, wine, coffee, steakhouse, sushi, pepper,
  ocean, forest, spring, arctic, sand, neon, vogue, industrial, midnight, vintage, deep-code, candy, minimal, royal.
- `ui.languages.labels`: opcional en la práctica (`.catch` con valores por defecto).
- Seasonal: se lee la clave `active` (default false); la clave `seasonal` de eu-amo-coxinha se ignora.
- Cada sección de `ui` (navbar, search, filters, pagination, catalog…) debe existir como objeto, aunque sus campos tengan `.catch`: la plantilla las incluye todas.
- `infra.cloudinary`: si no valida, el catálogo cae a `cloudName: "defaultCloudName"` y las imágenes se rompen.

## Plantilla de creación de tenant (decisión: completa) — se implementa en la 2b
Estructura copiada de sabor-urbano, sin datos de ningún negocio:
- `companyHours`: 7 días `"closed"`; `manualOpenOverride: null`; `delivery.enabled: false` (tienda cerrada hasta configurarla).
- `currency` y `ui.languages` (es/en/pt/zh) iguales a sabor-urbano; `themePalette` válido (p. ej. `classic`); `seasonal.active: false`.
- `infra.cloudinary`: `cloudName "dcc3vag3g"`, `defaultWidth 512`, `defaultExtension "webp"` (cuenta compartida), editable solo por SuperAdmin.
- El formulario pide al crear: nombre, dirección, teléfono y WhatsApp (obligatorios por el schema), además de slug, plan, locale, zona horaria y email de contacto.

## Hallazgos de datos
- `eu-amo-coxinha`: clave `seasonal` en lugar de `active` (inerte, en false); sin `ui.languages.labels` (opcional).
- `sabor-urbano`: `appDescription.zh` tiene la palabra "wilderness" en medio del texto chino. Corregir con el panel en uso real o a mano.
