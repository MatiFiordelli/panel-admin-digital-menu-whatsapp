# Notificaciones y gestos

## Notificaciones (toasts + historial)
- **Regla:** todo aviso al usuario pasa por `notify.success|error|warning|info(mensaje)` (`src/core/notifications/notify.ts`).
  Muestra el toast Y lo guarda en el historial. No llamar a `toast` de sonner directamente.
- **Historial:** `localStorage["admin-notifications"]`, más nuevo primero, tope `NOTIFICATIONS.MAX_STORED` (100).
  Cada entrada guarda tipo, mensaje (ya traducido, en el idioma de ese momento), fecha/hora y si fue leída.
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
Responde a "¿esta app puede llegar a la API?", no solo a "¿el dispositivo tiene red?" (`connectivity-store.ts`). Señales:
1. Eventos `offline` / `online` del navegador (offline es inmediato; online dispara una comprobación).
2. Resultado de cada request: respuesta < 500 = alcanzable; error de red sin respuesta = sin conexión.
3. Sonda a la API (`ENDPOINTS.probe`, hoy `/auth/me`) con estas reglas de costo:
   - se **omite** si algún request real tuvo éxito en los últimos 30 s (la actividad ya prueba que hay conexión);
   - solo corre con la pestaña **visible**; en reposo, como máximo 1 cada 30 s;
   - tras un fallo se reconfirma a los 4 s; con 2 fallos seguidos pasa a "sin conexión";
   - estando sin conexión comprueba cada 5 s (esos requests fallan en local y no cuestan nada al servidor) para recuperarse rápido.
Valores en `UI_CONFIG.CONNECTIVITY`.
**Por qué un 5xx cuenta como fallo en la sonda:** en desarrollo el navegador habla con el proxy LOCAL de Vite, que sigue
respondiendo (con 500) aunque el Wi-Fi esté apagado. Con "cualquier respuesta = conectado", cortar el Wi-Fi no se detectaba;
emular "Offline" en DevTools sí, porque bloquea también localhost.
Mejora posible: si `GET /api/v1/health/live` responde 200, apuntar `ENDPOINTS.probe` ahí (no consulta sesión ni base).
No está acoplado al `onlineManager` de TanStack Query a propósito: un falso "offline" no debe pausar logins ni guardados.
