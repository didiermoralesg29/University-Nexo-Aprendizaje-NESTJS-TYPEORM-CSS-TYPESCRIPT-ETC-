# 3. Aprender a leer código (parte 1)

Antes de mirar cómo funciona Nexo University por dentro, necesitas poder **leer** el código.
No hace falta saber escribirlo todavía: solo entender qué dice, como cuando lees una receta.

En este capítulo verás las piezas más básicas. Todos los ejemplos vienen de Nexo University.

## 1. Comentarios: notas para personas 📝

```ts
// Esto es un comentario. La computadora lo ignora.
/* Esto también es un comentario,
   y puede ocupar varias líneas. */
```

Los comentarios son **explicaciones para quien lee el código**. En Nexo University hay muchos
para ayudarte. Cuando abras un archivo, **lee primero los comentarios**.

## 2. Variables: cajitas con nombre 📦

Una **variable** es una cajita con una etiqueta, donde guardas un dato para usarlo después.

```ts
const nombre = 'Sofía Martínez'
let semestre = 1
```

- `const` → una cajita que **no cambia** después de llenarla (constante).
- `let` → una cajita que **puede cambiar** después.

```ts
let semestre = 1
semestre = 2        // ✅ se puede, porque es let

const nombre = 'Sofía'
nombre = 'Ana'      // ❌ error: una const no se puede cambiar
```

> 💡 En Nexo University casi todo es `const`. Se usa `let` solo cuando el valor de verdad
> tiene que cambiar.

## 3. Tipos: qué clase de dato hay en la cajita 🏷️

Los datos pueden ser de distintos **tipos**:

| Tipo | Qué es | Ejemplo |
|---|---|---|
| `string` | Texto (siempre entre comillas) | `'Programación I'` |
| `number` | Número | `4.5`, `30` |
| `boolean` | Sí o no (verdadero o falso) | `true`, `false` |
| `null` | "Vacío a propósito", no hay nada | `null` |
| `undefined` | "Nunca se llenó" | `undefined` |

TypeScript permite **escribir el tipo** con dos puntos `:`, para que te avise si te equivocas:

```ts
let creditos: number = 4
creditos = 'cuatro'   // ❌ TypeScript te avisa: "eso no es un número"
```

A veces un dato puede ser de dos tipos. Se usa la barra `|`, que se lee "**o**":

```ts
let telefono: string | null = null   // puede ser un texto O estar vacío
```

En Nexo esto pasa mucho: un estudiante puede no tener teléfono (`null`), o una evaluación
puede no tener nota todavía.

## 4. Textos con huecos 🧩

Para armar un texto con datos adentro, se usan comillas invertidas `` ` `` y `${ }`:

```ts
const nombre = 'Sofía'
const mensaje = `Hola, ${nombre}`   // → "Hola, Sofía"
```

Lo que va dentro de `${ }` se reemplaza por su valor. Ejemplo real del backend:

```ts
`No existe la clase ${id}`   // si id es 999 → "No existe la clase 999"
```

## 5. Objetos: fichas con datos 🗂️

Un **objeto** agrupa varios datos sobre **una misma cosa**, como una ficha:

```ts
const estudiante = {
  nombre: 'Sofía Martínez',
  semestre: 1,
  activo: true,
}
```

Para leer un dato de la ficha se usa un **punto**:

```ts
estudiante.nombre     // → 'Sofía Martínez'
estudiante.semestre   // → 1
```

Una ficha puede tener otra ficha adentro:

```ts
const clase = {
  asignatura: { codigo: 'IS101', nombre: 'Programación I' },
  profesor: { nombre: 'Ana Gómez' },
}

clase.asignatura.nombre   // → 'Programación I'
clase.profesor.nombre     // → 'Ana Gómez'
```

> 💡 ¿Te suena? Es igual que el **JSON** del capítulo 1. JSON es justamente la forma de
> escribir objetos para enviarlos entre el frontend y el backend.

## 6. Listas: varias cosas en fila 📋

Una **lista** (técnicamente *array*) guarda varios datos en orden, entre corchetes `[ ]`:

```ts
const dias = ['Lunes', 'Martes', 'Miércoles']
const notas = [4.0, 3.5, 2.8]
```

- `dias[0]` → `'Lunes'` (¡se empieza a contar desde **0**!)
- `dias.length` → `3` (cuántos elementos hay)

Puede ser una lista de fichas:

```ts
const estudiantes = [
  { nombre: 'Sofía', semestre: 1 },
  { nombre: 'Mateo', semestre: 1 },
]
```

## 7. Comparar 🔍

| Símbolo | Pregunta | Ejemplo | Resultado |
|---|---|---|---|
| `===` | ¿Son iguales? | `rol === 'rector'` | `true` si el rol es rector |
| `!==` | ¿Son distintos? | `rol !== 'rector'` | `true` si NO es rector |
| `>` `<` | ¿Mayor? ¿Menor? | `nota > 3` | |
| `>=` `<=` | ¿Mayor o igual? ¿Menor o igual? | `nota >= 3` | `true` si aprobó |

Y para combinar preguntas:

| Símbolo | Se lee | Ejemplo |
|---|---|---|
| `&&` | **y** (las dos deben cumplirse) | `rol === 'profesor' && esSuClase` |
| `\|\|` | **o** (basta con una) | `rol === 'rector' \|\| esSuClase` |
| `!` | **no** (lo contrario) | `!activo` → "no está activo" |

## 8. Tomar decisiones: `if` 🔀

`if` significa "**si**". Ejecuta algo **solo si** se cumple una condición:

```ts
if (nota >= 3) {
  estado = 'Aprobada'
} else {
  estado = 'Reprobada'
}
```

Se lee: *"**Si** la nota es mayor o igual a 3, el estado es Aprobada. **Si no**, Reprobada."*

### La versión corta: `? :`

Cuando la decisión es simple, se escribe en una sola línea:

```ts
const color = nota >= 3 ? 'verde' : 'rojo'
```

Se lee: *"¿La nota es mayor o igual a 3? **Entonces** verde. **Si no**, rojo."*

## 9. Dos atajos muy usados en Nexo

### `??` → "si no hay nada, usa esto otro"

```ts
const telefono = estudiante.telefono ?? 'Sin teléfono'
```

Si `estudiante.telefono` es `null` o `undefined`, usa `'Sin teléfono'`.

### `?.` → "si existe, entra; si no, no te caigas"

```ts
estudiante.programa?.nombre
```

Si el estudiante **tiene** programa, devuelve su nombre. Si **no tiene** (`null`), devuelve
`undefined` en lugar de dar un error.

Se usan juntos muchísimo:

```ts
estudiante.programa?.nombre ?? '—'
// "el nombre del programa, y si no tiene programa, una rayita"
```

## Resumen

| Pieza | Para qué |
|---|---|
| `//` | Comentario (explicación para personas) |
| `const`, `let` | Guardar un dato en una cajita |
| `string`, `number`, `boolean`, `null` | Tipos de datos |
| `` `Hola ${nombre}` `` | Texto con huecos |
| `{ nombre: 'Sofía' }` | Objeto (ficha) |
| `['a', 'b']` | Lista |
| `===`, `>=`, `&&`, `\|\|`, `!` | Comparar y combinar |
| `if / else`, `? :` | Tomar decisiones |
| `??`, `?.` | Atajos para datos que pueden faltar |

➡️ Siguiente: [Aprender a leer código (parte 2)](04-leer-codigo-parte-2.md)
