# 13. El frontend habla con el backend

En el capítulo anterior viste cómo se arman las pantallas. Pero una pantalla de notas sin
notas no sirve de nada: los datos están en el backend. En este capítulo verás **cómo el
frontend pide y envía datos**, y cómo recuerda quién inició sesión.

Es el momento en que **todo lo que has aprendido se junta**.

## 1. Dos puertas en la misma casa 🚪🚪

Recuerda el capítulo 1: el frontend vive en la puerta **5173** y el backend en la **3000**.

¿Cómo llega un pedido del frontend al backend? Gracias a **Vite** (el programa que sirve el
frontend). En `frontend/vite.config.ts`:

```ts
server: {
  port: 5173,
  proxy: { '/api': 'http://localhost:3000' },
}
```

Se lee: *"si alguien pide algo que empiece por `/api`, **reenvíalo** a la puerta 3000"*.

Es como un **recepcionista**: tú le entregas un sobre en la recepción del edificio (5173) y él
lo lleva a la oficina correcta (3000). A ese reenvío se le llama **proxy**.

¿Para qué sirve?
- En el código del frontend solo escribimos `/api/clases`, sin preocuparnos por la puerta.
- El navegador tiene una protección (llamada **CORS**) que bloquea pedidos entre puertas
  distintas. Con el recepcionista, el navegador cree que todo viene de la misma puerta y no
  bloquea nada.

## 2. El mensajero oficial: la función `api` 📨

**Todos** los pedidos al backend pasan por una sola función, en
`frontend/src/api/cliente.ts`. Así se usa:

```ts
// Ver mis clases (GET)
const clases = await api('/clases')

// Crear una clase (POST), enviando datos
await api('/clases', { metodo: 'POST', cuerpo: { asignaturaId: 1, dia: 'Lunes', ... } })
```

Por dentro, la función hace esto en orden:

1. **Busca la manilla** (el token del capítulo 10) en el bolsillo del navegador.
2. **Arma el pedido**: le agrega `/api` al principio, la manilla en una cabecera especial
   (`Authorization: Bearer <manilla>`) y convierte los datos a JSON.
3. **Lo envía** con `fetch`, que es la herramienta del navegador para hacer pedidos.
4. **Revisa la respuesta**:
   - Si el número es bueno (200, 201…) → devuelve los datos.
   - Si es **401** (manilla vencida) → cierra la sesión.
   - Si es otro error → **lanza** un error con el mensaje en español que mandó el backend
     (por ejemplo *"Se cruza con Programación I"*).
   - Si el backend está apagado → lanza el error *"No se pudo conectar con el backend.
     ¿Está encendido?"*.

> 💡 Tener **un solo mensajero** es muy útil: si mañana cambia algo (por ejemplo, cómo se
> envía la manilla), se cambia en un solo archivo y no en 20 pantallas.

### El bolsillo del navegador: `localStorage` 👖

La manilla se guarda en el **`localStorage`**: un pequeño espacio de memoria que el navegador
le da a cada página. Lo que se guarda ahí **sobrevive** aunque cierres la pestaña o recargues.

Por eso, si recargas la página, sigues con la sesión iniciada.

## 3. Saber la forma de los datos: `tipos.ts` 📐

En `frontend/src/api/tipos.ts` describimos (con `interface`, capítulo 4) la forma de cada
respuesta del backend:

```ts
export interface ClaseResumen {
  id: number
  asignatura: { id: number; codigo: string; nombre: string; creditos: number }
  profesor: { id: number; nombre: string }
  dia: Dia
  horaInicio: string
  ...
}
```

¿Para qué? Para que TypeScript te avise si te equivocas. Si escribes `clase.asignatura.nombr`
(sin la "e"), VS Code lo subraya en rojo **antes** de que lo pruebes.

> ⚠️ Si cambias lo que responde el backend, también hay que actualizar este archivo. El
> frontend y el backend deben estar **de acuerdo** en la forma de los datos.

## 4. Cargar datos al abrir una pantalla: `useDatos` 📦

Casi todas las pantallas hacen lo mismo: *"al abrirme, pide estos datos al backend y
muéstralos"*. Para no repetir ese código en cada pantalla, creamos una herramienta propia
(un hook, capítulo 12): `frontend/src/hooks/useDatos.ts`.

Así se usa en `paginas/Clases.tsx`:

```tsx
const { datos, cargando, error } = useDatos('/clases')

if (cargando) return <Cargando />              // todavía no llega → circulito
if (error) return <Aviso>{error}</Aviso>       // llegó un error → mensaje rojo
return <TablaClases clases={datos} />          // llegaron los datos → tabla
```

Es como mandar a un **mensajero** y tener tres situaciones posibles:

| Situación | `cargando` | `error` | `datos` | Qué se muestra |
|---|---|---|---|---|
| El mensajero va en camino | `true` | `null` | — | Circulito "Cargando…" |
| Volvió con malas noticias | `false` | el mensaje | — | Aviso rojo |
| Volvió con los datos | `false` | `null` | ¡los datos! | La tabla |

### ¿Cómo funciona por dentro? `useEffect`

`useDatos` usa otro hook de React: **`useEffect`**. Significa *"**después de dibujar** la
pantalla, haz esto"*. Es perfecto para pedir datos: primero se dibuja "Cargando…", y luego se
manda al mensajero.

```ts
useEffect(() => {
  api(ruta).then((datos) => guardarResultado(datos))
}, [ruta])
```

El `[ruta]` del final significa: *"vuelve a hacerlo **si la ruta cambia**"*. Por ejemplo, en la
pestaña de asistencia, cuando eliges otra fecha, la ruta cambia de
`/asistencia?fecha=2026-10-19` a `/asistencia?fecha=2026-10-12`, y `useDatos` pide los datos
de la nueva fecha **solo**.

`useDatos` además entrega dos herramientas extra:
- `recargar()` → *"vuelve a pedir los datos"* (por ejemplo, después de publicar un material).
- `setDatos(nuevos)` → *"reemplaza los datos por estos"* (cuando el backend ya nos devolvió
  la versión actualizada al guardar, para no tener que pedirlos otra vez).

## 5. Recordar quién inició sesión 🪪

Casi todas las pantallas necesitan saber quién eres: el menú, los botones, los títulos…
Pasar ese dato de pieza en pieza sería muy pesado.

React tiene una solución llamada **contexto**: una **cartelera** a la entrada del edificio que
todas las pantallas pueden mirar.

### El que escribe en la cartelera: `AuthProvider`

`frontend/src/auth/AuthProvider.tsx` envuelve toda la aplicación (lo viste en `main.tsx`,
capítulo 12) y se encarga de:

| Momento | Qué hace |
|---|---|
| Al **abrir** la página | Si hay manilla en el bolsillo, pregunta al backend *"¿quién soy?"* (`GET /api/auth/perfil`) para recuperar la sesión |
| Al **iniciar sesión** | Envía correo y contraseña (`POST /api/auth/login`), guarda la manilla en el bolsillo y anota al usuario en la cartelera |
| Al **cerrar sesión** | Bota la manilla y borra al usuario de la cartelera |
| Si la manilla **vence** | El mensajero `api` avisa (401) y se cierra la sesión sola |

### El que lee la cartelera: `useAuth`

Desde cualquier pantalla:

```tsx
const { usuario, tieneRol, cerrarSesion } = useAuth()
```

Ejemplos reales:

```tsx
<h1>Hola, {usuario.nombre}</h1>

{tieneRol('profesor', 'rector') && <button>+ Nueva clase</button>}
// "si es profesor o rector, muestra el botón"

<button onClick={cerrarSesion}>Salir</button>
```

## 6. Enviar formularios ✍️

Veamos el formulario de registrar un estudiante (`paginas/FormularioUsuario.tsx`, resumido):

```tsx
// 1. Una pizarra (estado) por cada campo
const [nombre, setNombre] = useState('')
const [email, setEmail] = useState('')
const [error, setError] = useState(null)

// 2. Qué hacer al pulsar "Registrar"
async function enviar(evento) {
  evento.preventDefault()        // evita que el navegador recargue la página
  try {
    await api('/usuarios', { metodo: 'POST', cuerpo: { nombre, email, ... } })
    navegar('/estudiantes', { state: { mensaje: 'Andrés fue registrado correctamente' } })
  } catch (e) {
    setError(textoDeError(e))    // muestra en rojo lo que dijo el backend
  }
}

// 3. El formulario en pantalla
<form onSubmit={enviar}>
  <Aviso>{error}</Aviso>
  <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
  <button type="submit">Registrar</button>
</form>
```

Paso a paso:
1. Cada campo tiene su pizarra. Al escribir, se actualiza.
2. Al pulsar el botón, se ejecuta `enviar`.
3. `preventDefault` evita el comportamiento viejo de los formularios (recargar la página).
4. Se **intenta** (`try`) enviar al backend.
5. Si sale bien → va a la lista de estudiantes con un mensaje verde.
6. Si sale mal → se **atrapa** (`catch`) el error y se muestra en rojo.

> 💡 `required` y `type="email"` son revisiones **rápidas** del navegador, antes de enviar.
> Pero el backend **vuelve a revisar** todo con sus formularios con reglas (DTO, capítulo 7),
> porque no se confía en el navegador (capítulo 10).

### Un detalle de diseño: no guardar dos copias 📑

En la planilla de notas, el profesor edita varias casillas antes de guardar. Una forma
ingenua sería copiar **todas** las notas del backend a una pizarra y editarlas ahí. El
problema: tendríamos **dos copias** de lo mismo, y mantenerlas iguales trae errores.

En Nexo hacemos algo más simple: la pizarra guarda **solo las casillas que el profesor
cambió**:

```tsx
const [editadas, setEditadas] = useState({})          // solo los cambios
const original = celdasDesde(planilla)                 // lo que dice el backend
const celdas = { ...original, ...editadas }            // lo que se ve = original + cambios
```

`{ ...original, ...editadas }` se lee: *"copia todo lo original, y encima pon los cambios"*.
Los tres puntos `...` significan "copia todo lo de adentro".

Al guardar, se envían solo los cambios y se limpia la pizarra. Además, las casillas cambiadas
se pintan de azul para que el profesor sepa qué falta guardar.

Lo mismo se hace en la asistencia (solo se recuerdan las casillas que el profesor tocó).

## 7. El viaje completo: la profesora guarda una nota 🚀

Ahora juntemos **todo** lo que has aprendido en la guía, en un solo recorrido:

```
FRONTEND (capítulos 12-13)
 1. Ana escribe 4.5 en la casilla del Examen final de Sofía
    → se guarda en la pizarra "editadas" y la casilla se pinta azul
 2. Pulsa "Guardar notas (1)"
 3. Se revisa en el navegador que 4.5 esté entre 0 y 5
 4. El mensajero api envía:
    PUT /api/clases/1/notas  + manilla de Ana  + { notas: [{ ..., valor: 4.5 }] }
 5. Vite (el recepcionista) lo reenvía a la puerta 3000
        │
        ▼
BACKEND (capítulos 7-11)
 6. Guardia 1: ¿la manilla es auténtica y no ha vencido?           ✔ es Ana, profesora
 7. Guardia 2: ¿los profesores pueden usar esta ventanilla?          ✔ @Roles('profesor', 'rector')
 8. Formulario con reglas: ¿el valor es un número entre 0 y 5?     ✔
 9. Funcionario de Calificaciones pide ayuda a Clases:
    ¿la clase 1 es de Ana?                                          ✔ puedeGestionar
10. ¿La evaluación y la inscripción son de la clase 1?             ✔
11. Guarda la nota en la tabla "notas" (con TypeORM)
12. Recalcula la planilla: definitiva, promedio actual, estado      (calculos.ts)
13. Responde 200 con la planilla nueva
        │
        ▼
BASE DE DATOS (capítulos 6 y 9)
    nueva fila en "notas": inscripción de Sofía, Examen final, 4.5
        │
        ▼
FRONTEND
14. setDatos(planillaNueva) → React redibuja la tabla
15. Se limpia la pizarra "editadas" (la casilla deja de estar azul)
16. Aparece el aviso verde "1 nota(s) guardada(s)"
17. El estado de Sofía cambia de "En curso" a "Aprobada" 🟢
```

Si entiendes este recorrido, **entiendes cómo funciona Nexo University**. 🎉

## Resumen

- Vite **reenvía** los pedidos `/api` al backend (proxy).
- Todos los pedidos pasan por el mensajero `api`, que pone la manilla y traduce los errores.
- La manilla se guarda en el `localStorage` (el bolsillo del navegador).
- `useDatos` carga datos al abrir una pantalla, con tres estados: cargando, error o datos.
- `AuthProvider` escribe en la **cartelera** quién inició sesión, y `useAuth` la lee.
- Los formularios **intentan** enviar y, si falla, **atrapan** el error y lo muestran.

➡️ Siguiente: [El diseño: colores y tamaños](14-frontend-diseno.md)
