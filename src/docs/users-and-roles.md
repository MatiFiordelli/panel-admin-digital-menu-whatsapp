# Usuarios, roles y sesiones

## Roles
- **SuperAdmin:** administra todos los tenants. No pertenece a ninguno (`tenantId` nulo). Para trabajar dentro de un tenant «entra» (ver `tenants.md`).
- **TenantAdmin:** pertenece a UN tenant (su JWT lleva el slug) y solo ve y modifica los datos de ese tenant.
- Los roles son una lista (`ROLES`) con `hasRole(...)`: sumar un rol de empleado (menos permisos) más adelante es un cambio chico.

## Quién crea las cuentas
**Solo un SuperAdmin**, desde la sección «Acceso» de la edición del tenant (`POST /users` exige SuperAdmin). No hay registro público: un TenantAdmin no puede crear su cuenta ni la de otras personas.
Un flujo de alta propia (self-signup) o de invitación de colegas por parte de un TenantAdmin no está planificado; requeriría endpoints nuevos en la API (alcance limitado al propio tenant) y verificación de email.

## Varios administradores por tenant
Un tenant puede tener tantos TenantAdmin como se necesite (el único dato único es el email). Productos y categorías guardan **quién los creó** (`createdBy`, una sola vez) y **quién los modificó por última vez** (`updatedBy`), ambos como referencia al usuario (se muestra su email).
Límites: no es un historial (solo el último editor; un borrado lógico o una restauración también sobrescriben `updatedBy`). Un registro completo de auditoría no está construido (ver pendientes de la API).

## El email es el nombre de usuario
El email identifica la cuenta para iniciar sesión; **no se verifica** (no se envía ningún correo) porque las cuentas las crea una persona de confianza (el SuperAdmin) y le entrega la contraseña temporal. Si algún día se agregan «olvidé mi contraseña» o altas propias, habrá que verificar el email.

## Contraseñas
- La API exige mínimo 8 caracteres; el panel además limita a 72 (límite de bcrypt) y pide **repetirla** (los campos se rellenan solos al usar «Generar»).
- No se exigen símbolos ni mayúsculas: la recomendación actual (NIST 800-63B) es priorizar la longitud sobre las reglas de composición. Las contraseñas generadas tienen 14 caracteres aleatorios (~80 bits).
- Una contraseña mal tipeada no se puede recuperar: no hay restablecimiento (pendiente: «cambiar contraseña» desde el panel).

## Sesiones
- La sesión es una cookie con un JWT de 7 días. **Desactivar** una cuenta tiene efecto en la **siguiente petición** de esa persona (la API rechaza el token con 401 y el panel la saca de la sesión); no es instantáneo en una pantalla ya abierta.
- **Bloqueo** (5 intentos fallidos = 10 minutos): impide INICIAR sesión; las sesiones ya abiertas hoy NO se cierran. Cerrarlas al bloquear permitiría que cualquiera saque a otra persona de su sesión fallando a propósito su contraseña (basta con conocer el email), así que no se recomienda.
  Alternativa propuesta (pendiente de decisión): un botón «Cerrar sesiones» para el SuperAdmin, que requiere una marca en la API (p. ej. `sessionsValidAfter` en el usuario, comprobada en `authenticate`).
