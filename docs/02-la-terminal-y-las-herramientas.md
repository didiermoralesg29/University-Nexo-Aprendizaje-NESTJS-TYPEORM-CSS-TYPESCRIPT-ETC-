# 2. La terminal y las herramientas

En el capítulo anterior viste las tres partes de una página web. Ahora vamos a ver **con qué
herramientas** se construye cada una y **cómo se creó** este proyecto desde cero.

## 1. La terminal 💻

La **terminal** es una ventana donde le das órdenes a la computadora **escribiendo**, en vez
de hacer clic con el mouse.

- En VS Code se abre con **Terminal → New Terminal**.
- Escribes una orden (un **comando**), presionas **Enter** y la computadora la ejecuta.
- Lo que la computadora responde aparece debajo, como texto.

Ejemplo: si escribes `node -v`, la computadora responde con la versión de Node.js que tienes
(por ejemplo `v24.21.0`).

> 💡 Los programadores usan mucho la terminal porque es más rápido escribir una orden que
> buscar botones. No te asustes: en este proyecto solo necesitas unos pocos comandos.

## 2. El idioma: JavaScript y TypeScript 🗣️

Para darle instrucciones a la computadora hay que escribirlas en un **lenguaje de
programación**. Las páginas web usan **JavaScript**.

Nosotros usamos **TypeScript**, que es JavaScript con un "ayudante" extra: te avisa de errores
**antes** de ejecutar el programa. Por ejemplo, si dices que algo es un número y luego le
pones una palabra, TypeScript te marca el error en rojo en VS Code.

> 💡 Piensa en TypeScript como el **corrector de Word**: te subraya los errores mientras
> escribes, antes de entregar el trabajo.

Los archivos de TypeScript terminan en `.ts`, o en `.tsx` si además dibujan pantallas.
En los capítulos 3 y 4 aprenderás a leerlo.

### La traducción

El navegador y Node.js **no entienden TypeScript**, solo JavaScript. Por eso, antes de
ejecutar, el código se **traduce** de TypeScript a JavaScript. A eso se le llama **compilar**.

```
tu código (.ts)  ──── compilar (traducir) ────►  JavaScript (.js)  ────►  se ejecuta
```

En el backend, el código traducido queda en la carpeta `dist/`. Por eso esa carpeta **no se
toca**: se borra y se crea de nuevo cada vez.

## 3. Node.js: el motor ⚙️

JavaScript nació para funcionar **dentro del navegador**. **Node.js** es un programa que
permite ejecutar JavaScript **fuera** del navegador, directamente en la computadora.

Gracias a Node.js podemos escribir el **backend** en el mismo idioma que el frontend.

## 4. npm: la tienda de herramientas 🛒

Nadie programa todo desde cero. Hay miles de herramientas gratuitas hechas por otras personas
(para conectarse a una base de datos, para revisar contraseñas, para dibujar pantallas…).

**npm** es como una **tienda de aplicaciones** de esas herramientas. A cada herramienta se le
llama **paquete** o **librería**.

| Comando | Qué hace |
|---|---|
| `npm install` | Descarga todas las herramientas que el proyecto necesita |
| `npm install nombre` | Descarga una herramienta nueva y la anota en la lista |
| `npm run algo` | Ejecuta un **atajo** llamado "algo" |

### `package.json`: la lista de compras 📝

Cada parte del proyecto tiene un archivo `package.json`. Es como una **lista de compras**
con dos secciones importantes:

```json
{
  "scripts": {
    "dev": "vite"
  },
  "dependencies": {
    "react": "^19.3.1"
  }
}
```

- **`dependencies`**: qué herramientas necesita el proyecto y en qué versión.
- **`scripts`**: **atajos**. Cuando escribes `npm run dev`, npm busca el atajo `dev` y
  ejecuta lo que dice al lado (en este caso, `vite`).

### `node_modules`: la bodega 📦

Cuando ejecutas `npm install`, npm descarga las herramientas de la lista y las guarda en una
carpeta llamada `node_modules`. Es **enorme** (miles de archivos) y **nunca se toca a mano**.

Si se borra, no pasa nada: `npm install` la vuelve a llenar leyendo la lista de compras.

### `package-lock.json`: la factura 🧾

Anota la **versión exacta** de cada herramienta que se descargó. Sirve para que, si otra
persona instala el proyecto, reciba exactamente lo mismo que tú. Tampoco se toca.

## 5. Cómo se creó este proyecto 🏗️

Estos fueron los pasos, en orden:

### Paso 1: crear el backend con NestJS

```bash
npx @nestjs/cli new proyect
```

**NestJS** es un **molde** para hacer backends ordenados. Este comando creó un proyecto
básico con sus carpetas, su `package.json` y un ejemplo de "Hola mundo". Después lo movimos a
la carpeta `backend/`.

> 💡 `npx` es como `npm`, pero en vez de instalar una herramienta, la **usa una vez** y ya.

### Paso 2: agregar herramientas al backend

```bash
npm install @nestjs/typeorm typeorm pg @nestjs/jwt bcryptjs class-validator class-transformer @nestjs/config
```

| Herramienta | Para qué la usamos (en simple) | Capítulo |
|---|---|---|
| `@nestjs/config` | Leer el archivo de secretos (`.env`) | 9 |
| `typeorm` y `@nestjs/typeorm` | Guardar y buscar en la base de datos sin escribir su idioma | 9 |
| `pg` | El "cable" que conecta con PostgreSQL | 9 |
| `bcryptjs` | Proteger las contraseñas | 10 |
| `@nestjs/jwt` | Crear la "manilla" de sesión | 10 |
| `class-validator` y `class-transformer` | Revisar que los formularios lleguen bien llenos | 7 |

No te preocupes si no entiendes todavía para qué es cada una: cada capítulo lo explica.

### Paso 3: crear el frontend con React y Vite

```bash
npm create vite@latest frontend -- --template react-ts
```

- **React** es una herramienta para armar pantallas con piezas reutilizables (capítulo 12).
- **Vite** es el programa que **sirve** el frontend mientras programas: lo traduce, lo
  muestra en el navegador y lo actualiza al instante cuando guardas un cambio.

Después agregamos:

```bash
npm install react-router
```

**react-router** permite tener varias páginas (`/clases`, `/mis-notas`…) sin recargar el
navegador (capítulo 12).

### Paso 4: crear la base de datos

Tú ya tenías **PostgreSQL 18** instalado. Solo creamos dos bases de datos vacías:

- `nexo_university` → la de verdad, la que usas.
- `nexo_university_test` → una copia para las pruebas automáticas (capítulo 15), así las
  pruebas nunca dañan tus datos.

### Paso 5: un atajo para encender todo junto

En la carpeta principal creamos otro `package.json` con atajos, e instalamos
**concurrently**, una herramienta que ejecuta **dos comandos a la vez** en la misma terminal:

```json
"dev": "concurrently ... \"npm run start:dev --prefix backend\" \"npm run dev --prefix frontend\""
```

Se lee: *"enciende el backend (dentro de la carpeta backend) y el frontend (dentro de la
carpeta frontend) al mismo tiempo"*. `--prefix backend` significa "hazlo dentro de la carpeta
backend".

Por eso con un solo `npm run dev` se enciende todo. En la terminal, cada mensaje sale con su
etiqueta: `[backend]` en azul y `[frontend]` en morado.

## 6. Los "correctores" del código ✍️

Usamos dos herramientas que revisan el código, como un corrector de un trabajo escrito:

| Herramienta | Qué revisa | Comando |
|---|---|---|
| **Prettier** | La **presentación**: espacios, comillas, saltos de línea. Lo deja todo ordenado | `npm run format` |
| **Oxlint** | Los **errores comunes**, como olvidar algo importante | `npm run lint` |

No cambian lo que hace el programa: solo lo dejan más limpio y te avisan de descuidos.

## 7. Git: la máquina del tiempo ⏳

**Git** guarda "fotos" de tu proyecto a lo largo del tiempo (cada foto se llama **commit**).
Si dañas algo, puedes volver a una foto anterior.

El archivo `.gitignore` es la lista de cosas que Git **no** debe guardar:
- `node_modules/` → se puede volver a descargar.
- `dist/` → se puede volver a traducir.
- `.env` → tiene contraseñas, ¡nunca debe subirse a internet!

## Resumen

- La **terminal** sirve para dar órdenes escribiendo.
- Escribimos en **TypeScript**, que se **traduce** a JavaScript para ejecutarse.
- **Node.js** ejecuta el backend. **npm** descarga herramientas (paquetes).
- `package.json` es la lista de herramientas y de atajos (`npm run …`).
- El backend se creó con **NestJS**, el frontend con **React + Vite**, y los datos viven en
  **PostgreSQL**.

➡️ Siguiente: [Aprender a leer código (parte 1)](03-leer-codigo-parte-1.md)
