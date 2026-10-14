# Tenants

## Lista (`/tenants`, solo SuperAdmin)
Tabla paginada de `GET /admin/tenants` con estado, fecha de creación y la acción "Gestionar" (entrar al tenant). Botón "Nuevo tenant".

## Botón "Entrar" (antes "Gestionar")
Un SuperAdmin no pertenece a ningún tenant, así que para administrar los productos, categorías y ajustes de un negocio primero "entra" a su tenant: el panel pasa
a enviar `x-tenant-id` con el slug y muestra «Gestionando: slug» arriba. No edita los datos del tenant (eso es "Editar"). Hasta la Fase 3 el único efecto visible es
ese indicador y el mensaje del inicio. Un tenant suspendido no se puede "entrar".

## Teléfono vs WhatsApp
Son dos datos distintos en el contrato del catálogo, y ambos deben ser no vacíos:
- **Teléfono** (`business.companyInfo.phone`): dato de contacto del negocio; texto libre (p. ej. `+54 3492 331704`).
- **WhatsApp** (`business.whatsapp.number`): el número que **recibe los pedidos** (arma el enlace de WhatsApp del checkout); solo dígitos con código
  de país (p. ej. `543492331704`). Pueden ser el mismo número, pero el formato difiere.

## Dominio propio (`metadata.customDomain`)
Para la API es opcional (único y disperso). Para el catálogo es **imprescindible para que el tenant se vea**: el catálogo resuelve cada
tenant por el dominio desde el que se visita (`/tenants/config/by-domain`), y su schema de metadata espera la clave presente. Por eso el panel
lo deja opcional al crear (a veces el dominio se conoce después), con un aviso en el campo; se puede agregar al editar.

## Crear (`/tenants/new`)
Formulario de una página: columna principal (negocio y región) y columna secundaria (cuenta e imágenes).
- **Obligatorio al crear** (lo exige el schema del catálogo, que rechaza vacíos): nombre, dirección, teléfono y WhatsApp.
  Además: slug, plan, email de contacto, región/idioma y zona horaria. Opcionales: dominio propio y, si el plan es `trial`, la fecha de fin.
- **Plantilla inicial** (`features/tenants/config/tenant-template.ts`): estructura de un tenant real sin datos de ningún negocio.
  Tienda cerrada (7 días `closed`, `manualOpenOverride: null`), delivery desactivado, moneda y 4 idiomas estándar,
  paleta `classic`, logos de relleno, redes con las URL base por defecto del catálogo. Idioma por defecto y moneda salen de la región elegida.
- **Cloudinary:** `cloudName` precargado con la cuenta compartida (`dcc3vag3g`), ancho 512, formato `webp`. Editable (solo SuperAdmin usa este panel).
- **Título y descripción públicos:** NO se piden en el formulario de creación (a propósito, para no alargarlo): se generan automáticamente y se editan después en la
  edición (2b parte 2, con pestañas por idioma). Se crean `metadata.appTitle` y `appDescription` en los 4 idiomas (`«Nombre | Menú Digital y Delivery»` y el texto estándar del catálogo).
  `metadata.seo` y `metadata.structuredData` NO se crean (dependen de imágenes e información que todavía no existe); se completan en la edición (2b parte 2).
- **Payload:** `tenantId` no se envía (la API lo deriva del slug); `customDomain` se omite si está vacío (campo único y disperso:
  enviar `""` o `null` colisionaría entre tenants); `isActive: true`, `version: "1.0.0"`.
- **Errores:** mensajes concretos en la notificación y marca en el campo (ver `forms.md`, punto 7).
- **Confirmar antes de crear** y **cambios sin guardar** (navegación interna incluida): ver `forms.md`.

## Supuestos a confirmar con la API (no documentados)
Confirmado con la API: la API solo valida el slug como string de 2 a 50 caracteres (el formato `a-z0-9-` es regla del panel: el slug es inmutable y va en URLs),
`trialEndsAt` acepta cualquier string (el panel envía ISO), el rango de 8 a 15 dígitos del WhatsApp es del panel (la API no valida `business`/`ui`; el catálogo solo exige que no esté vacío)
y el 409 no indica el campo (el panel lo infiere; un `code`/`field` en el 409 está propuesto).

## Editar (`/tenants/:id/edit`, solo SuperAdmin)
Se llega con el botón "Editar" de la lista. Breadcrumb: `Tenants › <nombre> › Editar` (el nombre no es un enlace: esa ruta no existe).
- **Se envía solo lo que cambió.** El PATCH de la API fusiona en profundidad; el panel compara el formulario con el tenant guardado
  (`core/lib/deep-diff.ts`, `tenant-edit.mapping.ts`) y manda únicamente las hojas modificadas. "Guardar" está deshabilitado sin cambios.
  Excepción: si cambia cualquier idioma de `appTitle`/`appDescription`, se envía el mapa completo `{es,en,pt,zh}` (la API lo documenta así).
- **Campos:** nombre (`business.companyInfo.name`), estado activo/suspendido, plan (+ fin de prueba si es `trial`), email, dominio, región, zona horaria,
  título y descripción públicos con pestañas por idioma (los idiomas son los que el tenant tiene en `ui.languages.supported`; solo el español es obligatorio),
  SEO y app instalable (palabras clave, IDs de imágenes de Cloudinary, colores, manifiesto), datos estructurados de Google (tipo, coordenadas, dirección,
  cocina, horarios, reservas) e imágenes (`infra.cloudinary`).
- **Slug:** de solo lectura. `createdAt`/`updatedAt`: solo se muestran.
- **Confirmación al guardar:** lista los campos EXACTOS que cambiaron (p. ej. «Título (EN)», «Cocina o especialidades»); si cambia el `cloudName` agrega la advertencia de que rompe las imágenes existentes.
- **"Guardar" y "Guardar y volver"**, errores en el campo y notificación concreta (igual que al crear), guardia de cambios sin guardar.
- **Lo que no se puede vaciar:** la API fusiona pero no elimina claves. Por eso un dominio o coordenadas ya cargados se pueden cambiar pero no dejar vacíos
  (enviar `""` o `null` en `customDomain` chocaría con el índice único). Los textos sí pueden quedar vacíos (se guarda `""`).
- **Listas** (`servesCuisine`, `openingHours`): se envían completas como arreglo. Pendiente confirmar con la API que un arreglo más corto REEMPLAZA al anterior
  y no se fusiona por posición (ver `pending-work.md`).

## Datos estructurados: tipo de negocio y cocina
El catálogo no es solo gastronomía: el tipo de negocio se elige entre 17 tipos de schema.org (restaurante, tienda, ferretería, pet shop, etc.).
"Cocina o especialidades" (`servesCuisine`, un arreglo de textos; cada elemento se ve como una etiqueta) solo aparece cuando el tipo es gastronómico
(restaurante, comida rápida, cafetería, panadería, bar, heladería). Si el tenant ya tenía valores y se cambia a un tipo no gastronómico, quedan guardados sin tocar.
Verificado: la API REEMPLAZA el arreglo completo en cada guardado (no deja restos).
### País
El país de los datos estructurados se elige de una lista (los 249 códigos ISO 3166-1), con el nombre en el idioma de la interfaz y el código entre paréntesis; se puede escribir las primeras letras para encontrarlo.
Junto a la lista se muestra la bandera (en Windows el navegador muestra dos letras en lugar de la bandera). Lo que se guarda es siempre un código válido.

## SEO y manifiesto
La sección «SEO y app instalable» incluye el manifiesto (PWA): orientación, modo de pantalla, íconos de 192/512/adaptable, capturas móvil y escritorio, color de tema y de fondo.
`manifest.id` y `start_url` no se editan (se conservan). Los IDs son identificadores públicos de Cloudinary.

## Acceso (usuarios del tenant), dentro de la edición
Sección «Acceso» debajo del formulario (`features/users`). Lista paginada de `GET /users?tenantId=<slug>`: email, estado (activo/inactivo, y «Bloqueado» si `lockedUntil` es futuro, con la hora en el `title`), fecha de alta y acciones.
- **Agregar usuario** (popup): email + contraseña temporal que hay que **repetir** (mínimo 8 y máximo 72 caracteres; «Generar» rellena ambas; botones **Generar** —sin caracteres confundibles— y **Copiar**, y mostrar/ocultar). Rol fijo **TenantAdmin** (un SuperAdmin no lleva tenant).
  Enviar solo valida; antes de crear hay confirmación. 409 = email repetido, marcado en el campo; 400 se reparte por campo.
- **Desactivar / Activar** (`PATCH /users/:id { isActive }`): desactivar pide confirmación; la persona no se borra y puede reactivarse. No hay baja definitiva de usuarios.
- **Desbloquear** (`PATCH /users/:id { unlock: true }`): aparece solo si la cuenta está bloqueada (5 intentos fallidos = 10 minutos).
- No incluido (la API lo permite): cambiar la contraseña de un usuario existente. Anotado en pendientes.
