# Preferencias y tema

Solo afectan a la interfaz del admin (separado del branding de los tenants). Se guardan en
`localStorage["admin-prefs"]` (modo, paleta, animaciones); el idioma en `localStorage["admin-language"]`.

## Dónde está
Botón **Preferencias** (⚙) en el menú lateral (escritorio y móvil). En el login, que no tiene menú, hay un botón de engranaje arriba a la derecha.
El popup vive a nivel de layout (`PreferencesPopup`); el estado de apertura está en `ui-store`.

## Qué se puede cambiar
- **Apariencia:** claro / oscuro / sistema (sistema sigue al SO en vivo).
- **Paleta** (select): Pinar (emerald, por defecto), Crepúsculo (indigo), Brasa (rose), Trigal (amber).
  Cada paleta cambia fondo de página, tarjetas, menú lateral, texto y color de marca, en claro y en oscuro.
- **Animaciones:** on/off (`data-motion="off"` + `reducedMotion="always"`). En "on" se sigue respetando la opción del SO.
- **Idioma:** es / en / pt / zh.

## Cómo funciona
1. `preferences-store.ts`: estado persistido y lista `PALETTES` (`id` interno + `swatch`).
2. `apply.ts`: pone `dark`, `data-theme` y `data-motion` en `<html>`; un script inline en `index.html` lo hace antes del primer pintado.
3. `themes.css`: todos los valores de color, un par de bloques (claro/oscuro) por paleta.

## Tokens (clases Tailwind)
`bg-paper` fondo · `bg-surface` tarjetas/inputs/tabla/cabecera/pie · `text-ink` texto · `bg-rail`/`text-rail-fg` menú (oscuro en ambos modos) ·
`bg-brand` rellenos · `bg-brand-dark` hover · `text-brand-text` texto/contornos de marca · `text-danger`.
Los componentes de shadcn siguen el tema (puente `--primary`, `--ring`, `--background`, etc.).

## Agregar / quitar una paleta
Agregar: copiar un par de bloques en `themes.css`, sumar `{ id, swatch }` a `PALETTES` y `prefs.palettes.<id>` en los 4 idiomas.
Quitar: borrar bloque, entrada y claves; quien la tenía guardada pasa a la paleta por defecto.

## Gestos y popups
Todo popup usa `shared/components/ui/Popup.tsx`: hoja inferior en móvil (se cierra arrastrando el encabezado hacia abajo), diálogo en escritorio; "X", Escape y toque en el fondo.
El menú móvil se cierra arrastrándolo, arrastrando hacia la izquierda desde cualquier parte fuera de él (el panel sigue al dedo), tocando el fondo o con Escape.

## Barra de estado (pie)
Muestra conexión (`navigator.onLine`) y la hora de la última actualización exitosa de datos (el `dataUpdatedAt` más reciente de las consultas, excluyendo la sesión), más un indicador "Sincronizando…". Toast al perder y recuperar conexión.

## A tener en cuenta
Opciones de estilo de tablas: pendiente (ver `pending-work.md`). Falta probar en táctil real el rebote del arrastre.

## Barras de scroll
Finas y discretas (`scrollbar-width: thin`, color derivado del texto con baja opacidad, sigue el modo y la paleta) y con el espacio
reservado (`scrollbar-gutter: stable`) para que no haya saltos al aparecer o al bloquear el scroll (popups). Todo en `themes.css`.
