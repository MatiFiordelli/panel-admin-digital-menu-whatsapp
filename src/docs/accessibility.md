# Accesibilidad

Objetivo: usable con teclado, lector de pantalla, zoom y sin mouse; cumplir WCAG 2.2 nivel AA donde sea razonable. Es una regla del proyecto: todo componente nuevo la cumple.

## Qué está implementado
- **Estructura:** `<html lang>` sigue el idioma de la interfaz; regiones con nombre (`header`, `nav`, `aside`, `main`); enlace «Saltar al contenido» (primer elemento al tabular).
- **Páginas:** cada página fija su título (`useDocumentTitle`: «Página · Catálogo Admin»). Al navegar, `RouteAnnouncer` lo anuncia (región `role="status"`) y el foco pasa al contenido principal.
- **Diálogos y menú móvil:** `role="dialog"`, `aria-modal`, `aria-labelledby`; **trampa de foco** (`useFocusTrap`): Tab/Shift+Tab se quedan dentro, apilable (un diálogo sobre otro), y el foco vuelve al elemento que lo abrió. El foco inicial va al panel (no a un botón) para que un Enter accidental no ejecute nada. Escape cierra. El menú cerrado es `inert`.
- **Formularios:** etiqueta visible asociada a cada control, `aria-required`, `aria-invalid`, `aria-describedby` apuntando al mensaje, mensajes en región `aria-live="polite"`, asterisco de obligatorio con texto para lectores («obligatorio»), `autocomplete`/`inputMode`/`type` correctos. Errores en línea y también resumidos en una alerta cuando corresponde.
- **Tablas:** `<caption>` (oculto), `<th scope="col">`, botones de acción con nombre completo («Editar Mi Negocio»).
- **Pestañas de idioma:** patrón WAI-ARIA de tabs: flechas izquierda/derecha, Inicio/Fin, solo la pestaña activa entra en el orden de Tab; cada una con el nombre del idioma.
- **Teclado en general:** todo lo operable con mouse lo es con teclado; los gestos táctiles (arrastrar el menú o un popup) tienen alternativa con botón «×», Escape o toque en el fondo. Los tooltips aparecen con foco de teclado y se cierran con Escape (`aria-describedby`).
- **Contraste:** texto pequeño secundario con al menos 70 % de opacidad del color de texto (≈ 5,8:1) y placeholders al 65 %; colores de marca para texto separados de los de relleno (`brand-text`). Los íconos son decorativos (`aria-hidden`) o llevan nombre.
- **Movimiento:** se respeta `prefers-reduced-motion` y el interruptor «Animaciones» de Preferencias.
- **Punteros y títulos:** `cursor: pointer` en todo control interactivo y `not-allowed` en deshabilitados (reglas globales en `themes.css`); atributo `title` en botones de solo ícono, textos truncados y pestañas.
- **Color:** los campos de color tienen selector nativo + caja hexadecimal sincronizados, cada uno con su nombre accesible.

## Lista de verificación para componentes nuevos
1. ¿Se puede usar solo con teclado y se ve el foco? 2. ¿Cada control tiene nombre accesible (etiqueta, `aria-label` o texto)? 3. ¿Un botón de solo ícono tiene `aria-label` y `title`?
4. ¿Los estados (`aria-expanded`, `aria-pressed`, `aria-checked`, `aria-selected`, `aria-busy`) reflejan lo que se ve? 5. ¿Los mensajes dinámicos se anuncian (`role="alert"`/`aria-live`)?
6. ¿La página nueva llama a `useDocumentTitle`? 7. ¿Un popup usa `Popup`? 8. ¿Contraste suficiente en claro y oscuro? 9. ¿Respeta reducir movimiento? 10. ¿Textos por i18n, también los `aria-label` y `title`?

## Límites conocidos / pendiente
- No se probó con lectores de pantalla reales (VoiceOver, NVDA): hacerlo antes de cerrar la Fase 6.
- Contrastes de las cuatro paletas estimados, no medidos con herramienta; medir con una auditoría (Lighthouse/axe) en la Fase 6.
- Algunos botones pequeños («×») miden 24 px (cumple AA de tamaño mínimo, no el objetivo de 44 px de AAA).
- Los textos de error que devuelve la API se muestran tal cual (no siempre están en el idioma de la interfaz).
