# 5. Las carpetas del proyecto

Ya sabes leer código básico. Ahora vamos a **recorrer el proyecto** carpeta por carpeta, para
que sepas dónde está cada cosa. Aquí solo damos un vistazo: cada parte se explica con calma
en su capítulo.

## La vista general

```
Proyect/
├── backend/        ⚙️  La cocina (el servidor)
├── frontend/       🖥️  El salón (las pantallas)
├── docs/           📚  Esta guía
├── README.md       📄  Resumen del proyecto y cómo encenderlo
├── package.json    🔧  Atajos para manejar todo (npm run dev…)
└── .gitignore      🙈  Lo que Git no debe guardar
```

> 💡 Los archivos que empiezan con un punto (como `.gitignore` o `.env`) son archivos de
> **configuración**. A veces VS Code o Windows los muestran más claros o los esconden.

## ¿Qué puedo tocar?

| Carpeta o archivo | ¿La toco? | ¿Por qué? |
|---|---|---|
| `frontend/src/` | ✅ Sí | Son las pantallas |
| `backend/src/` | ✅ Sí | Son las reglas y los datos |
| `backend/.env` | ✅ Con cuidado | Tiene tus contraseñas |
| `node_modules/` | ❌ Nunca | Herramientas descargadas (capítulo 2) |
| `dist/` | ❌ Nunca | Código traducido, se crea solo (capítulo 2) |
| `package-lock.json` | ❌ Nunca | La "factura" de npm (capítulo 2) |

## El backend por dentro ⚙️

```
backend/
├── .env                 🔒 Secretos: contraseña de PostgreSQL y clave de sesión
├── .env.example         📄 La misma lista, pero sin los secretos (para compartir)
├── package.json         📝 Herramientas y atajos del backend
├── tsconfig.json        ⚙️ Reglas para traducir TypeScript
├── nest-cli.json        ⚙️ Configuración de NestJS
├── src/                 💻 EL CÓDIGO
│   ├── main.ts               ← El interruptor: enciende el servidor
│   ├── configurar-app.ts     ← Ajustes generales (todas las rutas empiezan por /api…)
│   ├── app.module.ts         ← Une todos los departamentos
│   ├── config/               ← Cómo conectarse a PostgreSQL
│   ├── comun/                ← Cálculos que usan todos (notas, horarios)
│   ├── auth/                 ← 🔐 Portería: iniciar sesión y permisos
│   ├── usuarios/             ← 👥 Estudiantes, profesores y rector
│   ├── academico/            ← 📘 Carreras y asignaturas
│   ├── clases/               ← 🏫 Clases e inscripciones
│   ├── calificaciones/       ← 📝 Evaluaciones y notas
│   ├── asistencia/           ← ✅ Asistencia
│   ├── material/             ← 📎 Material de estudio
│   ├── reportes/             ← 📊 Reportes, boletines y el panel de inicio
│   └── semilla/              ← 🌱 Datos de ejemplo de la primera vez
└── test/                ← 🧪 Pruebas automáticas de la API completa
```

El backend está dividido en **departamentos**, como una universidad real (portería,
registro, académico…). Cada departamento es una carpeta. Lo verás en los capítulos 7 y 8.

## El frontend por dentro 🖥️

```
frontend/
├── index.html           📄 La única página HTML (React dibuja todo lo demás adentro)
├── package.json         📝 Herramientas y atajos del frontend
├── vite.config.ts       ⚙️ Configuración de Vite (puerto 5173 y conexión al backend)
├── public/              🖼️ Archivos que se sirven tal cual (el ícono de la pestaña)
└── src/                 💻 EL CÓDIGO
    ├── main.tsx              ← El interruptor: arranca React
    ├── App.tsx               ← La lista de páginas y sus direcciones
    ├── estilos.css           ← 🎨 Todo el diseño: colores, tamaños, celular
    ├── paginas/              ← Una pantalla por archivo (Login, Panel, Clases…)
    │   └── clase/            ← Las pestañas dentro de una clase (asistencia, notas…)
    ├── componentes/          ← Piezas que se repiten (menú, tablas, etiquetas…)
    ├── api/                  ← Cómo hablar con el backend
    ├── auth/                 ← Recordar quién inició sesión
    ├── hooks/                ← Herramientas propias (cargar datos)
    └── utilidades/           ← Ayudantes: formato de fechas y notas, descargar Excel
```

Lo verás en los capítulos 12, 13 y 14.

## Las pantallas que existen

Para que te ubiques, esta es la lista de pantallas (están en `frontend/src/paginas/`):

| Archivo | Pantalla | Quién la ve |
|---|---|---|
| `Login.tsx` | Iniciar sesión | Todos |
| `Panel.tsx` | Inicio: resumen y clases de hoy | Todos |
| `Clases.tsx` | Lista de clases (y crear una nueva) | Todos |
| `ClaseDetalle.tsx` | Una clase con sus pestañas | Todos (cada uno ve distintas pestañas) |
| `Inscripcion.tsx` | Inscribir materias | Estudiante |
| `Boletin.tsx` | Boletín de notas | Estudiante (el suyo) y rector |
| `ListaUsuarios.tsx` | Lista de estudiantes o profesores | Rector |
| `FormularioUsuario.tsx` | Registrar o editar estudiante/profesor | Rector |
| `Academico.tsx` | Carreras y asignaturas | Rector |
| `Material.tsx` | Material de estudio | Todos |
| `Reportes.tsx` | Resumen de todas las clases | Profesor y rector |
| `ReporteClase.tsx` | Reporte de notas imprimible | Profesor y rector |
| `Perfil.tsx` | Mis datos | Todos |

## Resumen

- `backend/` es la cocina y `frontend/` es el salón.
- El código está en las carpetas `src/` de cada uno.
- `node_modules/`, `dist/` y `package-lock.json` **no se tocan**.
- `backend/.env` guarda los secretos.

➡️ Siguiente: [La base de datos](06-la-base-de-datos.md)
