# 14. El diseño: colores y tamaños

Ya sabes cómo se arman las pantallas (capítulo 12) y cómo reciben datos (capítulo 13). Falta
la última capa: **cómo se ven**. Colores, tamaños, espacios, cómo se adaptan al celular y
cómo se imprimen.

Todo el diseño está en **un solo archivo**: `frontend/src/estilos.css`.

## 1. ¿Qué es CSS? 🎨

**CSS** es el idioma para decir **cómo se ve** cada cosa. Funciona con reglas así:

```css
.boton {
  background: blue;      /* color de fondo */
  color: white;          /* color del texto */
  padding: 8px 16px;     /* espacio por dentro */
  border-radius: 8px;    /* esquinas redondeadas */
}
```

Se lee: *"a todo lo que tenga la clase `boton`, ponle fondo azul, texto blanco, un poco de
espacio por dentro y esquinas redondeadas"*.

| Parte | Qué es |
|---|---|
| `.boton` | A **quién** se le aplica (todo lo que tenga `className="boton"`) |
| `background`, `color`… | **Qué** se cambia (se llama propiedad) |
| `blue`, `8px`… | **Cómo** queda (el valor) |

Y en el componente (capítulo 12):

```tsx
<button className="boton">Guardar</button>
```

> 💡 `px` son **píxeles**: los puntitos de la pantalla. `16px` es más o menos el tamaño de
> una letra normal.

### Combinar clases

Un elemento puede tener varias clases a la vez, separadas por espacio:

```tsx
<span className="etiqueta etiqueta-ok">4.2</span>
```

- `etiqueta` → la forma de pastilla (redondeada, letra en negrita).
- `etiqueta-ok` → los colores verdes.

Así, `etiqueta-alerta` usa la misma forma pero en rojo, sin repetir todo.

## 2. La paleta de colores: variables 🖌️

Al principio del archivo están los colores principales, guardados en **variables** (como las
cajitas del capítulo 3, pero en CSS):

```css
:root {
  --color-primario: #1d3f8f;        /* el azul de Nexo */
  --color-primario-oscuro: #142d68; /* azul más oscuro (al pasar el mouse) */
  --color-ok: #146c3a;              /* verde de "aprobado" */
  --color-alerta: #b42318;          /* rojo de "alerta" */
  --color-fondo: #f3f5f9;           /* gris clarito del fondo */
}
```

Y se usan con `var(...)`:

```css
.boton {
  background: var(--color-primario);
}
```

¿Para qué? Si quieres cambiar el azul de la universidad, lo cambias **en un solo lugar** y
cambia en todos lados: la barra de arriba, los botones, los enlaces, el login…

> 💡 Los códigos como `#1d3f8f` son colores en formato **hexadecimal**. No necesitas
> entenderlos: busca "selector de color" en Google, elige un color y copia su código.

## 3. Acomodar cosas en la pantalla 📐

Para poner cosas una al lado de la otra se usan dos herramientas de CSS:

### `flex`: en fila

```css
.acciones {
  display: flex;    /* pon los elementos uno al lado del otro */
  gap: 8px;         /* con 8 píxeles de separación */
  flex-wrap: wrap;  /* y si no caben, pasa a la siguiente línea */
}
```

Así se acomodan, por ejemplo, los botones "Reporte de notas", "Editar clase" y "Eliminar".

### `grid`: en cuadrícula

```css
.estadisticas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 16px;
}
```

La segunda línea parece complicada, pero dice: *"haz tantas columnas como quepan, cada una de
mínimo 170 píxeles"*. Así, las tarjetas del panel de inicio quedan:
- en la computadora: 4 en fila;
- en un celular: una debajo de otra.

¡Sin escribir nada especial para el celular!

## 4. Adaptarse al celular 📱

Para cambios más grandes se usa `@media`, que significa *"solo si la pantalla es así"*:

```css
@media (max-width: 800px) {
  .menu {
    flex-direction: row;   /* el menú pasa de vertical a horizontal */
    overflow-x: auto;      /* y se puede deslizar hacia los lados */
  }
}
```

Se lee: *"si la pantalla mide **800 píxeles o menos** (un celular o una tablet), el menú
lateral pasa arriba y se desliza con el dedo"*.

Las tablas anchas (como la planilla de notas) están dentro de una caja con:

```css
.tabla-contenedor {
  overflow-x: auto;
}
```

Que significa: *"si no cabe a lo ancho, deja deslizarla hacia los lados"*, en vez de romper
toda la página.

🧪 **Prueba:** en el navegador presiona `F12`, luego el ícono del celular 📱 (arriba a la
izquierda de la ventana que se abre). Verás la página como en un teléfono.

## 5. Imprimir y guardar en PDF 🖨️

Los reportes de notas y los boletines tienen un botón **"Imprimir / PDF"**. Al pulsarlo se
ejecuta:

```tsx
window.print()
```

que abre la ventana de imprimir del navegador. Ahí puedes elegir una impresora o
**"Guardar como PDF"**.

Pero no queremos que se impriman el menú ni los botones. Para eso hay reglas que **solo se
aplican al imprimir**:

```css
@media print {
  .barra,
  .menu,
  .no-imprimir {
    display: none !important;   /* escóndelos */
  }
}
```

Se lee: *"al imprimir, esconde la barra de arriba, el menú y todo lo que tenga la clase
`no-imprimir`"*. Por eso los botones del reporte tienen esa clase.

## 6. Descargar para Excel 📗

El botón **"Descargar Excel (CSV)"** está en `frontend/src/utilidades/csv.ts`.

**CSV** es un formato de texto muy simple que Excel sabe abrir. Es una tabla escrita con
punto y coma:

```
Código;Estudiante;Parcial 1 (30%);Definitiva
20260001;Sofía Martínez;3,6;2,3
20260002;Mateo Hernández;4,3;2,7
```

Cada línea es una fila, y cada `;` separa las columnas.

La función `descargarCsv`:
1. Convierte la tabla en ese texto.
2. Usa **coma** para los decimales (`3,6`) y **punto y coma** entre columnas, porque así lo
   espera el Excel en español.
3. Le agrega una marca invisible al inicio para que Excel muestre bien las tildes (á, é, ñ…).
4. Crea un archivo y lo descarga.

Todo pasa **en tu navegador**: el backend no tiene que hacer nada extra.

## Resumen

- Todo el diseño está en `frontend/src/estilos.css`.
- CSS se escribe con reglas: **a quién** (`.clase`), **qué** (propiedad) y **cómo** (valor).
- Los colores principales son **variables** al inicio del archivo.
- `flex` acomoda en fila, `grid` en cuadrícula.
- `@media (max-width: 800px)` adapta al celular; `@media print` adapta al imprimir.
- El CSV es una tabla de texto que Excel sabe abrir.

🎉 ¡Terminaste la parte del frontend!

➡️ Siguiente: [Pruebas, comandos y errores comunes](15-pruebas-y-problemas.md)
