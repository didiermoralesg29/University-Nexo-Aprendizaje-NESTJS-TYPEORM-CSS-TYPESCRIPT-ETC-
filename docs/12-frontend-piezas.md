# 12. Las piezas de la pantalla

Ya conoces toda la cocina (el backend). Ahora salimos al **salón**: el frontend, lo que ves
en el navegador. Está hecho con **React**.

En este capítulo veremos **cómo se arman las pantallas**. En el siguiente, cómo esas
pantallas le piden datos al backend.

## 1. Cómo arranca el frontend 🔌

Todo empieza en `frontend/index.html`, que es **casi vacío**:

```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

Tiene una caja vacía (`root`) y una orden: *"ejecuta `main.tsx`"*.

Luego `frontend/src/main.tsx` le dice a React: *"dibuja la aplicación dentro de esa caja"*:

```tsx
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>        {/* permite tener varias páginas */}
    <AuthProvider>       {/* recuerda quién inició sesión (capítulo 13) */}
      <App />            {/* la aplicación */}
    </AuthProvider>
  </BrowserRouter>,
)
```

> 💡 Solo existe **una** página HTML. Todo lo que ves (el login, el menú, las tablas…) lo
> **dibuja React** dentro de esa caja vacía. Cuando cambias de pantalla, React borra lo de
> adentro y dibuja lo nuevo, **sin recargar** el navegador. Por eso se siente rápido.

## 2. Componentes: piezas de Lego 🧱

React arma las pantallas con **componentes**: piezas que se pueden reutilizar, como fichas de
Lego.

Un componente es una **función** (capítulo 4) que **devuelve lo que se debe dibujar**. El más
sencillo de Nexo es `frontend/src/componentes/Cargando.tsx`:

```tsx
export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="cargando">
      <span className="cargando-circulo" />
      {texto}
    </div>
  )
}
```

Dibuja un circulito que gira y el texto "Cargando…". Se usa en todas las pantallas mientras
llegan los datos.

### Eso parece HTML… ¿lo es?

Casi. Se llama **JSX**: es HTML escrito dentro de TypeScript. Tres diferencias:

| En HTML | En JSX | Por qué |
|---|---|---|
| `class="boton"` | `className="boton"` | `class` es una palabra reservada de TypeScript (capítulo 4) |
| Solo texto fijo | `{ texto }` | Lo que va entre llaves es **código**: una variable, una cuenta… |
| `<!-- comentario -->` | `{/* comentario */}` | |

Ejemplo:

```tsx
<h1>Hola, {primerNombre}</h1>     // si primerNombre es "Laura" → "Hola, Laura"
```

### Usar un componente

Una vez creada la pieza, se usa **como si fuera una etiqueta HTML nueva**:

```tsx
<Cargando />                          // muestra "Cargando…"
<Cargando texto="Guardando notas" />  // muestra "Guardando notas"
```

### Props: las instrucciones para la pieza 📋

Los datos que le pasas a un componente se llaman **props**. Son como las instrucciones que le
das a un molde: *"hazlo con este texto"*, *"de este color"*.

Mira `EtiquetaNota` en `frontend/src/componentes/Etiquetas.tsx` (simplificado):

```tsx
export function EtiquetaNota({ valor }) {
  if (valor === null) return <span className="etiqueta etiqueta-neutra">—</span>
  const color = valor >= NOTA_APROBACION ? 'etiqueta-ok' : 'etiqueta-alerta'
  return <span className={`etiqueta ${color}`}>{valor.toFixed(1)}</span>
}
```

Se lee:
1. Si no hay nota, muestra una rayita gris.
2. Si la nota es 3.0 o más, usa la clase verde; si no, la roja (capítulo 3: el `? :`).
3. Muestra la nota con un decimal (`toFixed(1)` convierte 4 en "4.0").

```tsx
<EtiquetaNota valor={4.2} />    →  🟩 4.2
<EtiquetaNota valor={2.5} />    →  🟥 2.5
<EtiquetaNota valor={null} />   →  ⬜ —
```

Esta pieza se usa en la planilla de notas, el boletín y los reportes. **Si la cambias, cambia
en todos lados.**

### Piezas dentro de piezas

Una pantalla completa es una pieza grande hecha de piezas pequeñas:

```
Pantalla "Reporte de notas"  (paginas/ReporteClase.tsx)
├── Encabezado con botones "Imprimir" y "Descargar Excel"
├── 4 tarjetas de resumen (estudiantes, promedio, en riesgo, asistencia)
└── Tabla
    └── por cada estudiante:
        ├── EtiquetaNota        (promedio actual)
        ├── EtiquetaAsistencia  (porcentaje de asistencia)
        └── EtiquetaEstado      (Aprobada / Reprobada / En curso)
```

Las piezas que se usan en varias pantallas están en `componentes/`:

| Pieza | Qué dibuja |
|---|---|
| `Layout.tsx` | La barra azul de arriba y el menú lateral |
| `TablaClases.tsx` | Una tabla de clases (se usa en 3 pantallas) |
| `Etiquetas.tsx` | Las pastillas de colores de notas, asistencia y estado |
| `Aviso.tsx` | Los mensajes verdes (éxito) y rojos (error) |
| `Cargando.tsx` | El circulito que gira |
| `FormularioClase.tsx` | El formulario para crear o editar una clase |
| `ListaMaterial.tsx` | Las tarjetas de material de estudio |

### Mostrar listas: `map` 🔁

Para dibujar una fila por cada estudiante se usa `map` (capítulo 4: "transforma cada
elemento"):

```tsx
{estudiantes.map((e) => (
  <tr key={e.id}>
    <td>{e.nombre}</td>
    <td>{e.codigo}</td>
  </tr>
))}
```

Se lee: *"por cada estudiante, dibuja una fila con su nombre y su código"*.
`key` es una etiqueta única por fila que React necesita para no confundirlas.

### Mostrar algo solo a veces: `&&` 👁️

```tsx
{esRector && <button>Inscribir</button>}
```

Se lee: *"si es rector, **entonces** dibuja el botón"*. Si no, no dibuja nada.

## 3. El estado: la memoria de la pantalla 🧠

Algunas cosas **cambian** mientras usas la página: lo que escribes en un buscador, la pestaña
abierta, si se está guardando…

Para recordarlas, React tiene el **estado**. Es como una **pizarra** donde la pantalla anota
cosas:

```tsx
const [buscar, setBuscar] = useState('')
```

| Parte | Qué es |
|---|---|
| `buscar` | Lo que está escrito ahora en la pizarra |
| `setBuscar` | El marcador para escribir algo nuevo |
| `useState('')` | Crea la pizarra, empezando vacía (`''`) |

Ejemplo real, el buscador de `paginas/Clases.tsx`:

```tsx
<input value={buscar} onChange={(e) => setBuscar(e.target.value)} />
```

Cada vez que escribes una letra:
1. `onChange` ("cuando cambie") llama a `setBuscar` con el texto nuevo.
2. React **vuelve a dibujar** la pantalla con el nuevo valor de `buscar`.
3. Al redibujar, la lista se filtra con lo que escribiste:

   ```tsx
   const filtradas = clases.filter((c) => c.asignatura.nombre.toLowerCase().includes(texto))
   ```

> 💡 **La regla de oro de React:** tú no cambias la pantalla directamente. Cambias el
> **estado** y React **vuelve a dibujar** todo solo. Por eso nunca verás código que diga
> "borra esta fila" o "cambia este texto": se cambia el dato y la pantalla se actualiza.

## 4. Hooks: herramientas que empiezan por `use` 🔧

`useState` es una **herramienta especial** de React. A estas herramientas se les llama
**hooks**. Tienen dos reglas **obligatorias**:

1. Su nombre **siempre empieza por `use`**: `useState`, `useNavigate`, `useParams`…
   (Por eso las herramientas que creamos nosotros se llaman `useDatos` y `useAuth`.)
2. Se usan **arriba** del componente, nunca dentro de un `if` ni después de un `return`.

Si rompes una regla, el corrector (Oxlint, capítulo 2) te avisa en rojo.

## 5. Las páginas y sus direcciones 🗺️

### La lista de páginas: `App.tsx`

Es como el **índice de un libro**: dice qué pantalla mostrar según la dirección.

```tsx
<Routes>
  <Route path="/login" element={<Login />} />

  <Route element={<RutaProtegida><Layout /></RutaProtegida>}>
    <Route index element={<Panel />} />                    {/* "/"        → Panel */}
    <Route path="clases" element={<Clases />} />           {/* "/clases"  → Clases */}
    <Route path="clases/:id" element={<ClaseDetalle />} /> {/* "/clases/3" → una clase */}
    ...
  </Route>
</Routes>
```

- `path` es la dirección. `:id` es una parte que cambia (igual que en el backend, capítulo 7).
- Las páginas de adentro están **dentro de** `Layout`: todas comparten la barra azul y el
  menú. Dentro de `Layout` hay una pieza especial, `<Outlet />`, que significa *"aquí va la
  página actual"*. Es como un marco de foto donde se cambia la foto.
- `RutaProtegida` revisa que hayas iniciado sesión. Si no, te manda al login.

### Páginas solo para algunos roles

```tsx
<Route path="estudiantes" element={
  <RutaProtegida roles={['rector']}>
    <ListaUsuarios rol="estudiante" />
  </RutaProtegida>
} />
```

Si un estudiante escribe `/estudiantes` a mano en el navegador, ve *"Sin permiso"*.

> ⚠️ Recuerda el capítulo 10: esto solo **esconde** la pantalla. La seguridad real está en
> los guardias del backend.

### El menú cambia según el rol

En `componentes/Layout.tsx` hay tres listas de opciones:

```tsx
const MENU = {
  estudiante: [ { a: '/', texto: 'Inicio' }, { a: '/inscripcion', texto: 'Inscribir materias' }, … ],
  profesor:   [ { a: '/', texto: 'Inicio' }, { a: '/clases', texto: 'Mis clases' }, … ],
  rector:     [ { a: '/', texto: 'Inicio' }, { a: '/estudiantes', texto: 'Estudiantes' }, … ],
}
```

Y dibuja la lista que corresponde: `MENU[usuario.rol]`. Si eres profesor, `MENU['profesor']`.

### Moverse entre páginas

| Herramienta | Para qué | Ejemplo |
|---|---|---|
| `<Link to="/clases">` | Un enlace que cambia de página sin recargar | El botón "← Volver a clases" |
| `<NavLink>` | Como Link, pero sabe si es la página actual (para resaltarla en el menú) | El menú lateral |
| `useNavigate()` | Cambiar de página **desde el código** | Después de crear una clase, ir a ella |
| `useParams()` | Leer la parte que cambia de la dirección | En `/clases/3`, saber que es la 3 |
| `useSearchParams()` | Leer lo que va después del `?` | En `/clases/3?pestana=notas`, saber que la pestaña es "notas" |

Ejemplo de `paginas/ClaseDetalle.tsx`:

```tsx
const { id } = useParams()     // en /clases/3 → id = "3"
```

Las **pestañas** de una clase (Estudiantes, Asistencia, Notas, Material) guardan cuál está
abierta en la dirección (`?pestana=notas`). Así, si recargas la página, sigues en la misma
pestaña.

## Resumen

- `index.html` tiene una caja vacía; `main.tsx` le dice a React que dibuje ahí.
- La pantalla se arma con **componentes** (piezas de Lego) escritos en **JSX**.
- Los **props** son las instrucciones que le pasas a una pieza.
- El **estado** es la memoria de la pantalla: cambias el estado y React redibuja solo.
- Los **hooks** son herramientas que empiezan por `use`.
- `App.tsx` es el índice de páginas; `Layout` es el marco común con el menú.

➡️ Siguiente: [El frontend habla con el backend](13-frontend-habla-con-backend.md)
