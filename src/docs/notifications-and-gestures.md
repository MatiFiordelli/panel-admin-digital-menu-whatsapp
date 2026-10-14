# Notificaciones y gestos

## Notificaciones (toasts + historial)
- **Regla:** todo aviso al usuario pasa por `notify.success|error|warning|info("clave.i18n", { params })` (`src/core/notifications/notify.ts`).
  Muestra el toast (traducido en ese momento) Y guarda en el historial la **clave y los parámetros**, no el texto. No llamar a `toast` de sonner directamente
  ni pasar texto ya traducido.
- **El historial siempre se muestra en el idioma actual**, aunque la notificación se haya generado en otro idioma. Los parámetros pueden referenciar claves
  (`{ $t: "tenants.fields.slug", then: ": texto" }`) para que también esas partes se re-traduzcan; el texto crudo de la API (si lo hay) se muestra tal cual.
  Las notificaciones guardadas antes de este cambio solo tienen texto y se muestran como estaban.
- **Historial:** `localStorage["admin-notifications"]`, más nuevo primero, tope `NOTIFICATIONS.MAX_STORED` (100).
  Cada entrada guarda tipo, clave de traducción, parámetros, fecha/hora y si fue leída.
  No poner datos sensibles en los mensajes: el historial sobrevive al logout en ese navegador.
- **Campana** en la barra de estado (pie), con contador de no leídas (`99+` como tope visual). Al tocarla abre el
  popup del historial y marca todo como leído.
- **Popup:** cada notificación con el color de su tipo (verde éxito, rojo error, amarillo aviso, celeste info), fecha y
  hora, botón "×" para borrarla, filtro por tipo y "Limpiar todo". Se cierra con "×", Escape, fondo o deslizando.
- Alto mínimo de la lista: `NOTIFICATIONS.LIST_MIN_HEIGHT` (evita saltos al cambiar de filtro).
- Hoy generan notificaciones los cambios de conexión. Desde la Fase 2b, cada guardado/error de mutación debe usar `notify`.

## Gestos y umbrales (todo en `src/core/config/ui.config.ts`)
| Gesto | Umbral (valor por defecto) |
|---|---|
| Cerrar menú: arrastrar a la izquierda, sobre el menú o en cualquier parte fuera de él | 80 px o 500 px/s |
| Abrir menú: deslizar a la derecha empezando en el borde izquierdo | 60 px o 400 px/s (mín. 20 px) |
| Zona del borde izquierdo donde debe empezar el toque | 20 px |
| Cerrar popup en móvil: arrastrar el encabezado hacia abajo | 100 px o 500 px/s |
| Ancho del menú | 224 px |

Al abrir desde el borde el menú **sigue el dedo** (se ve cómo aparece); al soltar, si pasó el umbral se abre y si no vuelve a su lugar. Al cerrar arrastrando también sigue el dedo.
La posición del menú es un único valor compartido (`drawer-motion.ts`) que mueven tanto el menú como el gesto del borde.
**Limitación conocida:** iOS Safari y la navegación por gestos de Android usan los primeros ~20 px del borde para "volver
atrás"; en algunos dispositivos ese gesto puede ganarle al del menú. El botón ☰ siempre funciona.
La detección usa oyentes pasivos en `document` (sin una capa invisible que robe toques). Si el movimiento es más vertical que horizontal, se ignora (es un scroll).

## Conectividad (indicador "En línea / Sin conexión")
Responde a "¿esta app puede llegar a la API?", no solo a "¿el dispositivo tiene red?". `navigator.onLine` sigue en `true` con
Wi-Fi sin internet y algunos navegadores no emiten el evento, así que es solo UNA de las señales (`connectivity-store.ts`):
1. Eventos `offline` / `online` del navegador (offline es inmediato; online dispara una sonda antes de confirmar).
2. Resultado de cada request: cualquier respuesta HTTP (incluso 401/500) = alcanzable; error de red sin respuesta = sin conexión.
3. Sonda periódica a `GET /auth/me` (cada 15 s, solo con la pestaña visible; 2 fallos seguidos para declarar offline).
Valores en `UI_CONFIG.CONNECTIVITY`. El tiempo máximo para detectar un corte sin eventos es ~30 s; con eventos o requests, inmediato.
Los cambios de estado generan una notificación (`notify`). No está acoplado al `onlineManager` de TanStack Query a propósito:
un falso "offline" no debe pausar logins ni guardados.
