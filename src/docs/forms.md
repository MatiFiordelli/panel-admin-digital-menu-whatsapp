# Convenciones de formularios

Reglas que cumple TODO formulario del panel (login, tenants y los que vengan). Los componentes base son `FormField`
(`shared/components/ui/FormField.tsx`) y los estilos de `form-styles.ts`.

1. **Placeholder en cada campo de texto**, internacionalizado (es/en/pt/zh), con un ejemplo genérico (nunca datos de un negocio real).
   Los `select` siempre tienen un valor elegido, así que no llevan placeholder; el `date` nativo muestra el formato del navegador y no se traduce.
2. **Mensaje de error/ayuda con espacio reservado.** Debajo de cada campo hay siempre un área de dos líneas (`min-h-8`, `text-xs leading-4`),
   haya o no mensaje, para que mostrar/ocultar un error no mueva el resto del formulario. Aplica también al aviso del servidor (login y tenants).
   Para cambiar la reserva: una sola línea en `FormField.tsx`.
3. **Botón "X" para borrar** dentro de cada campo de texto/número/fecha con valor (`clearable`). Es solo de puntero (`tabIndex=-1`, no roba el
   foco del input); con teclado se borra con seleccionar todo + suprimir. En la contraseña no hay "X" (ya tiene Mostrar/Ocultar). Los `select` no la llevan (no pueden quedar vacíos).
   El control debe llevar `pr-9` (y `clearRight="right-9"` junto al ícono de un `date`).
4. **Errores en línea**, nunca como toast. El toast/notificación solo resume el resultado ("No se pudo crear…") y, cuando hace falta,
   explica el motivo concreto (ver abajo).
5. **Confirmar antes de guardar.** Enviar (botón o Enter) solo valida; después aparece un popup de confirmación y recién entonces se envía.
   Evita guardados por un Enter accidental.
6. **Cambios sin guardar:** `useUnsavedChangesGuard(dirty)` bloquea la navegación interna (enlaces, menú, botón atrás) con un popup de
   confirmación y avisa al cerrar/recargar la pestaña. Requiere el router de datos (`createBrowserRouter`, en `App.tsx`).
   Tras guardar, llamar a `allowNextNavigation()` antes de navegar.
7. **Errores de la API → mensajes concretos.** 409: "Ya existe un tenant con el slug «x»" / "con el dominio «y»" (usa `field`/`code` si la API
   los manda; si no, lo infiere del mensaje); 400: lista de campos con su mensaje; red: "no pudimos conectar". Cada uno marca además el campo.
8. **Indicador de obligatorio:** un asterisco rojo junto a la etiqueta (`required` en `FormField`; lector de pantalla: «obligatorio») y la nota
   «* Campo obligatorio» arriba del formulario. Los idiomas distintos del español no lo llevan (solo `es` es obligatorio).
9. **Tooltips en botones y controles de acción** (`shared/components/ui/Tooltip.tsx`): aparecen al pasar el mouse (tras `UI_CONFIG.TOOLTIPS.DELAY_MS`) y con foco de
   teclado, nunca en toques de pantalla táctil; se dibujan en un portal para que tablas y popups no los recorten. Todo botón cuyo efecto no sea obvio
   («Guardar» vs «Guardar y volver», «Entrar», «Editar») lleva uno, con texto traducido en `tooltips.*`.
10. **Validación reactiva:** los errores aparecen y desaparecen mientras se escribe (`UI_CONFIG.FORMS.VALIDATION_MODE = "onChange"`, una sola línea
   para cambiarlo a `"onBlur"` o `"onTouched"`). Borrar con la "X" también revalida al instante.
11. **Tipo de entrada apropiado y limpieza al escribir/pegar** (`features/tenants/lib/sanitize.ts` + `SanitizedInput`): teléfono solo dígitos y `+ - ( ) .`;
   WhatsApp solo dígitos; slug en minúsculas con espacios convertidos en guiones y sin caracteres inválidos; dominio en minúsculas, sin espacios y sin `https://`;
   ancho en píxeles solo enteros (se bloquean `e + - . ,`). Los atributos `inputMode`/`type` abren el teclado correcto en el celular.
12. Validaciones con Zod, mensajes traducidos, reconstruidos al cambiar de idioma.

## Limitación conocida: botón "atrás" del navegador
El popup propio aparece cuando "atrás" lleva a otra pantalla de la misma sesión de la app. Si la entrada anterior del historial pertenece a **otro
documento** (se recargó la página, se escribió la URL a mano, o se viene de otro sitio), el navegador descarga la página y lo único posible es su
aviso nativo (`beforeunload`), que no se puede personalizar. Para verificar el popup propio: entrar por clics (Tenants → Nuevo), escribir algo y tocar "atrás".

## Campos de lista (chips)
Las listas cortas (p. ej. cocina o especialidades) usan `TagsInput`: cada elemento es una etiqueta con su "×"; Enter o coma agrega, Backspace en vacío quita la
última y Enter NO envía el formulario. En el formulario el valor sigue siendo un texto separado por comas; al enviarse se convierte en arreglo.
## Campos que cambian de nombre
Un input registrado en React Hook Form no puede cambiar de nombre sobre el mismo elemento del DOM (se rompe al alternar). Cuando un panel muestra campos distintos
según una pestaña, el contenedor lleva `key={pestaña}` para que se vuelva a montar (así se arregló el cambio de idioma en título/descripción).

## Campos de color
`color()` en el formulario de edición: selector nativo (`<input type="color">`) + caja de texto hexadecimal, sincronizados. La caja es lo que se valida (`#rrggbb`) y se guarda; el selector muestra blanco mientras el valor esté vacío o sea inválido.
