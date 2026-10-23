# 15. Pruebas, comandos y errores comunes

Ya conoces todo el sistema. En este capítulo verás **cómo sabemos que funciona** (las pruebas),
todos los **comandos** disponibles y **qué hacer cuando algo falla**.

## 1. ¿Qué son las pruebas automáticas? 🧪

Imagina que cada vez que cambias algo tuvieras que entrar como rector, como profesor y como
estudiante, y probar a mano todas las pantallas. ¡Tardarías horas!

Las **pruebas automáticas** son pequeños programas que **revisan por ti** que todo funcione.
Los ejecutas con un comando y en segundos te dicen si algo se dañó.

> 💡 Piensa en ellas como un **control de calidad** en una fábrica: cada producto pasa por
> una máquina que revisa que esté bien antes de salir.

Usamos una herramienta llamada **Vitest** para escribirlas. Hay dos tipos.

### Tipo 1: pruebas de piezas sueltas (unitarias)

Revisan **una sola pieza**, sin encender el servidor ni la base de datos. Por ejemplo,
`backend/src/comun/calculos.spec.ts` revisa las reglas de notas:

```ts
describe('estadoMateria', () => {

  it('reprueba por fallas aunque la nota sea buena', () => {
    expect(estadoMateria(4.5, 100, 70)).toBe('Reprobada');
    expect(estadoMateria(4.5, 100, 80)).toBe('Aprobada');
  });

});
```

Se lee casi como español:

| Código | Significa |
|---|---|
| `describe('estadoMateria', …)` | "Pruebas de la función estadoMateria" (agrupa) |
| `it('reprueba por fallas…', …)` | "Debería reprobar por fallas aunque la nota sea buena" (una prueba) |
| `expect(X).toBe(Y)` | "**Espero** que X **sea** Y" |

Entonces: *"Espero que con nota 4.5, 100% evaluado y 70% de asistencia, el resultado sea
Reprobada. Y con 80% de asistencia, Aprobada."*

Hay pruebas para: la definitiva, el promedio actual, el estado, la asistencia, el promedio
ponderado, los cruces de horario y el guardia de roles.

Los archivos de estas pruebas terminan en **`.spec.ts`**.

### Tipo 2: pruebas de punta a punta (e2e)

Encienden el backend **de verdad**, con una base de datos de verdad, y hacen pedidos como lo
haría el frontend. Están en `backend/test/app.e2e-spec.ts`:

```ts
it('un profesor no puede ver las notas de una clase ajena', async () => {
  const ana = await login('ana.gomez@nexo.edu.co');
  // La clase 2 (Cálculo) es del profesor Jorge
  await api.get('/api/clases/2/notas').set('Authorization', `Bearer ${ana}`).expect(403);
});
```

Se lee: *"Inicia sesión como Ana. Pide las notas de la clase 2 mostrando su manilla. Espero
que la respuesta sea 403 (sin permiso)."*

"e2e" viene del inglés *end to end*: **de punta a punta**, del pedido hasta la base de datos.

Prueban: iniciar sesión, los permisos de cada rol, registrar y editar estudiantes, los
mensajes de error en español, guardar notas, los cruces de horario y los reportes.

#### ¿Y no dañan mis datos?

No. Usan **otra base de datos**: `nexo_university_test`. En
`backend/vitest.config.e2e.ts` está escrito:

```ts
env: {
  DB_NOMBRE: 'nexo_university_test',   // usa la base de datos de pruebas
  DB_REINICIAR: 'true',                // y bórrala y llénala de nuevo cada vez
},
```

Esos valores **tienen prioridad** sobre los del `.env` (capítulo 9). Así las pruebas siempre
empiezan con los mismos datos de ejemplo, y tus datos reales nunca se tocan.

### Ejecutar las pruebas

Desde la carpeta `Proyect`:

```bash
npm test
```

Verás algo así:

```
Tests  15 passed (15)     ← pruebas de piezas: 15 de 15 bien ✅
Tests  13 passed (13)     ← pruebas de punta a punta: 13 de 13 bien ✅
```

Si alguna falla, dice **cuál** y **qué esperaba** vs. **qué obtuvo**:

```
FAIL  reprueba por fallas aunque la nota sea buena
Expected: "Aprobada"
Received: "Reprobada"
```

Eso te avisa que tu cambio afectó algo. ¡Para eso existen!

### Prueba en un navegador de verdad

Además de esas pruebas, cuando construí el proyecto también lo probé **haciendo clic en un
navegador de verdad**, de forma automática: un programa abrió Edge, inició sesión con cada
rol, llenó formularios, guardó notas y asistencia, intentó cosas prohibidas, y tomó fotos de
las pantallas (también en tamaño celular). Se revisaron 31 pasos y todos funcionaron.

## 2. Los correctores del código ✍️

Además de las pruebas, hay dos "correctores" (capítulo 2):

| Comando | Qué hace |
|---|---|
| `npm run lint` | **Oxlint** busca errores comunes en backend y frontend |
| `npm run format` (dentro de `backend/` o `frontend/`) | **Prettier** ordena la presentación del código |

## 3. Todos los comandos 📋

### Desde la carpeta `Proyect` (los que más usarás)

| Comando | Qué hace | ¿Cuándo? |
|---|---|---|
| `npm run dev` | ⭐ Enciende backend y frontend | Cada vez que vas a trabajar |
| `Ctrl + C` | Apaga lo que esté encendido en esa terminal | Al terminar |
| `npm run instalar` | Descarga todas las herramientas | La primera vez, o si borraste `node_modules` |
| `npm test` | Ejecuta todas las pruebas del backend | Después de cambiar algo en el backend |
| `npm run lint` | Revisa errores comunes | Antes de terminar un cambio |
| `npm run build` | Traduce todo para publicarlo | Para comprobar que todo compila |
| `npm run reiniciar-datos` | ⚠️ Borra todo y vuelve a los datos de ejemplo | Si dañaste los datos |
| `npm run dev:backend` | Enciende solo el backend | Si solo trabajas en el backend |
| `npm run dev:frontend` | Enciende solo el frontend | Si el backend ya está encendido en otra terminal |

### Mientras trabajas con `npm run dev`

- Si guardas un cambio del **frontend**, la página se actualiza **sola, al instante**.
- Si guardas un cambio del **backend**, se traduce y reinicia solo en unos segundos. En la
  terminal verás `Found 0 errors` cuando esté listo (o el error, si te equivocaste).
- En la terminal, cada mensaje dice de dónde viene: `[backend]` o `[frontend]`.

## 4. Qué hacer si algo falla 🔧

| Lo que ves | Qué pasa | Qué hacer |
|---|---|---|
| En la página: *"No se pudo conectar con el backend"* | El backend está apagado o falló al encender | Mira la terminal: busca mensajes en rojo con `[backend]` |
| En la terminal: `password authentication failed` | La contraseña de PostgreSQL en `.env` está mal | Corrige `DB_CONTRASENA` en `backend/.env` |
| En la terminal: `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL está apagado | En Windows busca **Servicios** → `postgresql-x64-18` → clic derecho → **Iniciar** |
| En la terminal: `database "nexo_university" does not exist` | No existe la base de datos | En pgAdmin: clic derecho en *Databases* → *Create* → *Database…* → `nexo_university` |
| En la terminal: `EADDRINUSE` | Ya hay otro `npm run dev` encendido | Busca la otra terminal y apágala con `Ctrl + C` |
| En la terminal: `Nest can't resolve dependencies…` | A un departamento le falta un funcionario | Revisa `imports` y `exports` de los módulos (capítulo 8) |
| En la terminal: `error TS…` | Un error de TypeScript (escribiste algo mal) | Lee el archivo y la línea que indica; VS Code también lo marca en rojo |
| En la terminal: `'npm' no se reconoce…` | La terminal no encuentra Node.js | Cierra VS Code y ábrelo de nuevo |
| En la página: *"Tu sesión expiró"* | Pasaron 8 horas (la manilla venció) | Inicia sesión otra vez |
| La página está en blanco | Hay un error en el frontend | En el navegador presiona `F12` → pestaña **Console** → lee el mensaje en rojo |

> 💡 **Leer los errores es una habilidad, y se aprende.** Casi siempre el mensaje dice
> exactamente qué pasó y en qué archivo y línea. Si no lo entiendes, copia el mensaje en rojo y
> búscalo en Google: es lo que hacen todos los programadores, todos los días.

## Resumen

- Las **pruebas de piezas** revisan funciones sueltas; las **de punta a punta** revisan la API
  completa con una base de datos aparte.
- `npm test` las ejecuta todas en segundos.
- `npm run dev` enciende todo; `Ctrl + C` lo apaga.
- Los errores dicen qué pasó: léelos con calma.

➡️ Siguiente: [Ejercicios](16-ejercicios.md)
