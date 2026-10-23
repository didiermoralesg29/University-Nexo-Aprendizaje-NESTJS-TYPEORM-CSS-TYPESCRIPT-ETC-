# Nexo University

Plataforma académica de **Nexo University**. Estudiantes, profesores y el rector inician sesión
y cada uno puede hacer lo que su rol le permite: inscribir materias, crear clases, tomar
asistencia, poner notas, registrar estudiantes y generar reportes de notas.

Proyecto hecho para **aprender**: cada parte está explicada paso a paso en [`docs/`](docs/).

```
Proyect/
├── backend/    ← API con NestJS + PostgreSQL (puerto 3000)
├── frontend/   ← Interfaz con React + Vite (puerto 5173)  ← aquí trabajas el diseño
└── docs/       ← Guía de aprendizaje
```

## Requisitos

- **Node.js** 20 o superior
- **PostgreSQL** (este proyecto se probó con la versión 18)

## Cómo arrancarlo

**1. Instala las librerías** (solo la primera vez):

```bash
npm run instalar
```

**2. Crea la base de datos** (solo la primera vez). Abre *pgAdmin* → clic derecho en
*Databases* → *Create* → *Database…* → nombre `nexo_university`. O desde la terminal:

```bash
"C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres nexo_university
```

**3. Configura el backend:** copia `backend/.env.example` como `backend/.env` y escribe la
contraseña de tu PostgreSQL en `DB_CONTRASENA`. (En esta computadora ya está hecho.)

**4. Enciende todo:**

```bash
npm run dev
```

Abre **http://localhost:5173**. La primera vez el backend crea las tablas y unos datos de
ejemplo automáticamente.

## Cuentas de prueba (contraseña `nexo123`)

| Rol | Correo |
|---|---|
| Rector | `rector@nexo.edu.co` |
| Profesor | `ana.gomez@nexo.edu.co` |
| Estudiante | `sofia.martinez@nexo.edu.co` |

En la pantalla de inicio de sesión hay botones que las rellenan.

## Qué puede hacer cada rol

| | Estudiante | Profesor | Rector |
|---|:-:|:-:|:-:|
| Ver horario, material y su boletín de notas | ✅ | | ✅ |
| Inscribir y cancelar materias | ✅ | | ✅ |
| Crear clases | | ✅ | ✅ |
| Tomar asistencia y agregar notas | | ✅ sus clases | ✅ |
| Publicar material | | ✅ sus clases | ✅ |
| Generar reportes de notas (PDF / Excel) | su boletín | ✅ sus clases | ✅ |
| Registrar y editar estudiantes y profesores | | | ✅ |
| Programas y asignaturas | | | ✅ |

Detalle completo en [Iniciar sesión y permisos](docs/10-iniciar-sesion-y-permisos.md).

## Guía de aprendizaje

La guía está escrita para alguien que **nunca ha programado una página web**, y va de lo más
fácil a lo más difícil. Empieza por **[docs/00-empieza-aqui.md](docs/00-empieza-aqui.md)**.

| # | Capítulo |
|---|---|
| | **Parte 1 · Las bases** |
| 1 | [¿Qué es una página web por dentro?](docs/01-que-es-una-pagina-web.md) |
| 2 | [La terminal y las herramientas](docs/02-la-terminal-y-las-herramientas.md) |
| 3 | [Aprender a leer código (parte 1)](docs/03-leer-codigo-parte-1.md) |
| 4 | [Aprender a leer código (parte 2)](docs/04-leer-codigo-parte-2.md) |
| 5 | [Las carpetas del proyecto](docs/05-las-carpetas.md) |
| 6 | [La base de datos](docs/06-la-base-de-datos.md) |
| | **Parte 2 · El backend** |
| 7 | [Cómo el backend atiende un pedido](docs/07-backend-atender-un-pedido.md) |
| 8 | [Los departamentos del backend](docs/08-backend-departamentos.md) |
| 9 | [El backend y la base de datos](docs/09-backend-y-base-de-datos.md) |
| 10 | [Iniciar sesión y permisos](docs/10-iniciar-sesion-y-permisos.md) |
| 11 | [Las reglas de la universidad](docs/11-las-reglas-de-la-universidad.md) |
| | **Parte 3 · El frontend** |
| 12 | [Las piezas de la pantalla](docs/12-frontend-piezas.md) |
| 13 | [El frontend habla con el backend](docs/13-frontend-habla-con-backend.md) |
| 14 | [El diseño: colores y tamaños](docs/14-frontend-diseno.md) |
| | **Parte 4 · Comprobar y practicar** |
| 15 | [Pruebas, comandos y errores comunes](docs/15-pruebas-y-problemas.md) |
| 16 | [Ejercicios](docs/16-ejercicios.md) |
| 📖 | [Diccionario](docs/diccionario.md) |

## Comandos principales

| Comando | ¿Qué hace? |
|---|---|
| `npm run dev` | Enciende backend y frontend |
| `npm test` | Pruebas del backend |
| `npm run lint` | Revisa el código |
| `npm run reiniciar-datos` | Borra todo y vuelve a los datos de ejemplo |
