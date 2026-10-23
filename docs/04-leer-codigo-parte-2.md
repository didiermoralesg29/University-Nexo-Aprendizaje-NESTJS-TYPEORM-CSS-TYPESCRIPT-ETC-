# 4. Aprender a leer código (parte 2)

En la parte 1 viste los ladrillos básicos: cajitas, fichas, listas y decisiones. Ahora vas a
ver cómo se **agrupan** esos ladrillos para hacer cosas más grandes.

## 1. Funciones: recetas 📖

Una **función** es una **receta**: un conjunto de pasos con nombre, que puedes usar las veces
que quieras.

```ts
function porcentaje(parte: number, total: number) {
  return Math.round((parte / total) * 100)
}
```

Vamos parte por parte:

- `function porcentaje` → la receta se llama "porcentaje".
- `(parte, total)` → los **ingredientes** que necesita (se llaman **parámetros**).
- `return` → lo que la receta **entrega** al terminar (el plato).
- `Math.round` → redondear a número entero.

Para usarla, escribes su nombre y le das los ingredientes:

```ts
porcentaje(9, 12)   // → 75     (vino a 9 de 12 clases = 75%)
```

> 💡 Esta función existe de verdad en `backend/src/comun/calculos.ts`. Se usa para calcular
> la asistencia.

### Funciones flecha `=>`

Hay otra forma, más corta, de escribir funciones. Se llama **función flecha**:

```ts
const doble = (numero) => numero * 2

doble(4)   // → 8
```

Se lee: *"doble es una receta que recibe un número **y entrega** (`=>`) ese número por 2"*.
La verás muchísimo, sobre todo en el frontend y dentro de las operaciones con listas.

## 2. Operaciones con listas 📋

Las listas traen funciones listas para usar. Estas son las más importantes en Nexo.
Imagina esta lista:

```ts
const notas = [4.0, 2.5, 3.8, 2.9]
```

| Operación | Qué hace | Ejemplo | Resultado |
|---|---|---|---|
| `filter` | **Filtra**: deja solo las que cumplen | `notas.filter((n) => n >= 3)` | `[4.0, 3.8]` |
| `map` | **Transforma** cada elemento | `notas.map((n) => n * 10)` | `[40, 25, 38, 29]` |
| `find` | **Busca** el primero que cumpla | `notas.find((n) => n < 3)` | `2.5` |
| `some` | ¿**Alguno** cumple? | `notas.some((n) => n < 3)` | `true` |
| `includes` | ¿**Está** este valor? | `notas.includes(4.0)` | `true` |
| `reduce` | **Junta** todo en un solo valor | `notas.reduce((total, n) => total + n, 0)` | `13.2` (la suma) |

`reduce` es el más raro. Se lee así:

```ts
notas.reduce((total, n) => total + n, 0)
//            ↑      ↑      ↑         ↑
//      lo acumulado  cada   suma uno  empieza
//      hasta ahora   nota   más       en 0
```

Va recorriendo la lista y sumando: 0 → 4.0 → 6.5 → 10.3 → 13.2.

Un ejemplo real del frontend: contar los créditos de las materias inscritas:

```ts
const creditos = inscritas.reduce((total, c) => total + c.asignatura.creditos, 0)
```

## 3. Clases: moldes de galletas 🍪

Una **clase** es un **molde**. Con un molde de galletas puedes hacer muchas galletas con la
misma forma. Con una clase puedes crear muchos **objetos** con la misma forma.

```ts
class Programa {
  id: number
  nombre: string
  facultad: string
}
```

Este molde dice: *"todo programa tiene un id, un nombre y una facultad"*.

En el backend, las clases se usan para casi todo:
- moldes de **fichas** (cómo es un usuario, una clase, una nota);
- moldes de **trabajadores** (el que registra usuarios, el que calcula notas…).

### Dentro de una clase pueden ir funciones

A una función dentro de una clase se le llama **método**:

```ts
class ClasesService {
  buscar(id: number) {
    // ...pasos para buscar una clase
  }
}
```

Para usarla: `this.clasesService.buscar(3)`.

> 💡 `this` significa "**yo mismo**", el objeto actual. `this.clasesService` se lee
> "mi clasesService".

### El constructor

El **constructor** es lo primero que se ejecuta al crear un objeto con el molde. En el backend
lo usamos para decir **qué necesita** cada trabajador (lo verás en el capítulo 7):

```ts
constructor(private readonly clasesService: ClasesService) {}
```

- `private` → solo esta clase puede usarlo.
- `readonly` → no se puede reemplazar después.

## 4. Describir la forma de algo: `interface` y `type` 📐

A veces solo queremos **describir la forma** de una ficha, sin crear un molde completo:

```ts
interface UsuarioSesion {
  id: number
  rol: 'estudiante' | 'profesor' | 'rector'
  nombre: string
}
```

Se lee: *"un UsuarioSesion tiene un id (número), un rol (que solo puede ser estudiante,
profesor o rector) y un nombre (texto)"*.

`type` hace algo parecido:

```ts
type Dia = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado'
```

Ahora, si alguien escribe `'Domingo'` donde va un `Dia`, TypeScript avisa el error.

## 5. Compartir entre archivos: `export` e `import` 🔗

El código está repartido en **muchos archivos** para que sea ordenado. Para usar algo de otro
archivo:

1. El archivo que lo tiene lo **comparte** con `export`:

   ```ts
   // archivo calculos.ts
   export const NOTA_APROBACION = 3.0
   ```

2. El archivo que lo necesita lo **trae** con `import`:

   ```ts
   // otro archivo
   import { NOTA_APROBACION } from '../comun/calculos.js'
   ```

`'../comun/calculos.js'` es el **camino** hasta el archivo:
- `./` = "en esta misma carpeta"
- `../` = "sube una carpeta"

> 💡 En el backend los caminos terminan en `.js` aunque el archivo sea `.ts`. Es porque se
> ejecuta el código ya **traducido** (que es `.js`). En el frontend no hace falta.

## 6. Esperar: `async` y `await` ⏳

Algunas tareas **toman tiempo**: buscar en la base de datos, pedirle algo al backend…

Piensa en un **pedido a domicilio**: pides la pizza y **no te quedas congelado** en la puerta
esperando. Sigues haciendo otras cosas, y cuando llega, la recibes.

```ts
async function cargarClases() {
  const clases = await api('/clases')   // pide y ESPERA a que llegue
  console.log(clases)                   // esto se ejecuta cuando ya llegó
}
```

- `await` → "**espera aquí** hasta que llegue la respuesta".
- `async` → avisa que dentro de la función hay esperas.

Mientras espera, el programa puede atender otras cosas (por ejemplo, a otros usuarios).

## 7. Cuando algo sale mal: `throw` y `try / catch` 🚨

### `throw`: rechazar

`throw` significa "**detente aquí y avisa que hubo un problema**":

```ts
if (!clase) {
  throw new NotFoundException('No existe la clase 999')
}
```

### `try / catch`: intentar y atrapar

`try` significa "**intenta** esto". Si algo falla dentro, en vez de romperse todo, salta a
`catch` ("**atrapa** el error"):

```ts
try {
  await api('/usuarios', { metodo: 'POST', cuerpo: datos })
  // si salió bien, sigue aquí
} catch (e) {
  setError(textoDeError(e))   // si falló, muestra el mensaje en rojo
}
```

Así funcionan todos los formularios de Nexo: si el backend rechaza algo, el error se
**atrapa** y se muestra en pantalla en vez de romper la página.

## Resumen

| Pieza | Para qué | Analogía |
|---|---|---|
| `function`, `=>` | Agrupar pasos con nombre | Receta |
| `filter`, `map`, `find`, `reduce` | Trabajar con listas | Filtrar, transformar, buscar, sumar |
| `class` | Molde para crear objetos | Molde de galletas |
| `interface`, `type` | Describir la forma de algo | Plano |
| `export`, `import` | Compartir entre archivos | Prestar |
| `async`, `await` | Esperar tareas lentas | Pedido a domicilio |
| `throw`, `try/catch` | Avisar y atrapar errores | Alarma y red de seguridad |

🎉 ¡Con esto ya puedes **leer** casi todo el código de Nexo University! No hace falta que lo
memorices: vuelve a estos dos capítulos cuando veas algo raro.

➡️ Siguiente: [Las carpetas del proyecto](05-las-carpetas.md)
