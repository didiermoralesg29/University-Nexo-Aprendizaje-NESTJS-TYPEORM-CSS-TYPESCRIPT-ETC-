# 8. Los departamentos del backend

En el capítulo anterior viste **un** departamento (registro de usuarios) con su ventanilla y
su funcionario. Pero una universidad tiene muchos departamentos que **se ayudan entre sí**.
En este capítulo verás cómo se organizan.

## 1. Un departamento = un módulo 🏢

Cada carpeta del backend es un **departamento**. En el código se llama **módulo**, y tiene un
archivo que termina en `.module.ts` que dice **quién trabaja ahí**:

Archivo: `backend/src/material/material.module.ts`

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Material]), ClasesModule],
  controllers: [MaterialController],
  providers: [MaterialService],
})
export class MaterialModule {}
```

| Parte | Qué significa | En la oficina |
|---|---|---|
| `controllers` | Sus ventanillas | "Aquí se atiende al público en esta ventanilla" |
| `providers` | Sus funcionarios | "Estos son los trabajadores del departamento" |
| `imports` | Lo que necesita de otros | "Necesitamos acceso al archivador de materiales y ayuda del departamento de clases" |
| `exports` | Lo que presta a otros | "Prestamos a nuestro funcionario a quien lo necesite" |

## 2. Todos los departamentos de Nexo

| Departamento | Carpeta | Se encarga de… |
|---|---|---|
| 🔐 Portería | `auth/` | Iniciar sesión y revisar permisos (capítulo 10) |
| 👥 Registro | `usuarios/` | Registrar y editar estudiantes y profesores |
| 📘 Académico | `academico/` | Carreras y asignaturas |
| 🏫 Clases | `clases/` | Crear clases, inscribir estudiantes, y **decidir quién puede gestionar cada clase** |
| 📝 Calificaciones | `calificaciones/` | Evaluaciones, notas y la planilla |
| ✅ Asistencia | `asistencia/` | Registrar quién vino a clase |
| 📎 Material | `material/` | Publicar y listar material de estudio |
| 📊 Reportes | `reportes/` | Reportes de notas, boletines y el panel de inicio |
| 🌱 Semilla | `semilla/` | Crear los datos de ejemplo la primera vez |

## 3. Los departamentos se prestan funcionarios 🤝

El departamento de **Material** necesita saber si un profesor puede publicar en una clase
(*"¿esta clase es suya?"*). Esa pregunta ya la sabe responder el funcionario de **Clases**.
En vez de repetir la misma regla en dos lugares, Material **le pide prestado** el funcionario
a Clases.

Para que eso funcione se necesitan **dos cosas**:

**1. Clases dice "presto a mi funcionario"** (`clases.module.ts`):

```ts
exports: [ClasesService],
```

**2. Material dice "necesito ayuda de Clases"** (`material.module.ts`):

```ts
imports: [ClasesModule],
```

Así se ayudan todos en Nexo:

```
                     🏫 Clases
          (presta: "¿esta persona puede gestionar esta clase?")
            │            │             │             │
            ▼            ▼             ▼             ▼
     📝 Calificaciones  ✅ Asistencia  📎 Material   📊 Reportes
            │                                        ▲
            └── presta: "calcular la planilla" ──────┘

     👥 Usuarios ── presta: "buscar a un usuario" ──► 🔐 Portería
```

> 💡 Gracias a esto, la regla "un profesor solo maneja **sus** clases" está escrita **una sola
> vez** (en Clases) y la usan cuatro departamentos. Si algún día cambia, se cambia en un solo
> lugar.

> ⚠️ Si se te olvida el `exports` o el `imports`, el backend **no enciende** y muestra un
> mensaje como: *"Nest can't resolve dependencies of the MaterialService"*. Ahora sabes qué
> significa: "a Material le falta un funcionario que nadie le prestó".

## 4. El edificio completo: `app.module.ts` 🏛️

Hay un módulo especial que **reúne a todos los departamentos**, como el edificio de la
universidad: `backend/src/app.module.ts`.

```ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),   // leer los secretos del .env (capítulo 9)
    TypeOrmModule.forRootAsync({ ... }),        // conectarse a la base de datos (capítulo 9)
    AuthModule,
    UsuariosModule,
    AcademicoModule,
    ClasesModule,
    CalificacionesModule,
    AsistenciaModule,
    MaterialModule,
    ReportesModule,
    SemillaModule,
  ],
})
export class AppModule {}
```

Es el que `main.ts` usa para "armar la oficina completa" (capítulo 7). Si creas un
departamento nuevo, tienes que **agregarlo aquí**; si no, nadie sabrá que existe.

## 5. "No traigas tus herramientas, te las dan" 🧰

Mira cómo el funcionario de Material consigue al funcionario de Clases:

```ts
export class MaterialService {
  constructor(private readonly clasesService: ClasesService) {}
}
```

Nunca escribimos *"crea un funcionario de clases nuevo"*. Solo decimos en el constructor
**"necesito un `ClasesService`"** (capítulo 4: el constructor dice qué necesita cada uno), y
NestJS **se lo entrega** ya listo.

Es como el primer día en un trabajo nuevo: no llevas tu escritorio ni tu computador. La
empresa ya los tiene listos esperándote.

El nombre técnico asusta: **inyección de dependencias**. Pero la idea es solo esa:
**pide lo que necesitas y te lo dan**.

¿Por qué es útil?
- Hay **un solo** funcionario de cada tipo, compartido por todos (no se crean copias).
- Cada pieza solo dice qué necesita y NestJS resuelve en qué orden crear todo.
- En las pruebas (capítulo 15) se puede entregar un funcionario "de mentira" para probar.

## 6. Todas las ventanillas (la "carta" completa) 📜

Esta es la lista de todos los pedidos que el backend sabe atender (la **API**):

| Departamento | Pedido | Para qué |
|---|---|---|
| 🔐 Portería | `POST /api/auth/login` | Iniciar sesión |
| | `GET /api/auth/perfil` | Ver mis datos |
| | `PATCH /api/auth/perfil` | Cambiar mi teléfono o contraseña |
| 👥 Registro | `GET /api/usuarios?rol=estudiante` | Listar estudiantes o profesores |
| | `POST /api/usuarios` | Registrar |
| | `PATCH /api/usuarios/5` | Editar al usuario 5 |
| 📘 Académico | `GET /api/programas` · `POST /api/programas` | Ver / crear carreras |
| | `GET /api/asignaturas` · `POST /api/asignaturas` | Ver / crear materias |
| 🏫 Clases | `GET /api/clases` | Mis clases |
| | `GET /api/clases/oferta` | Clases disponibles para inscribir |
| | `GET /api/clases/3` | Ver la clase 3 |
| | `POST /api/clases` · `PATCH` · `DELETE /api/clases/3` | Crear, editar, eliminar |
| | `POST /api/clases/3/inscripciones` | Inscribirse en la clase 3 |
| | `DELETE /api/clases/3/inscripciones/12` | Cancelar la inscripción del estudiante 12 |
| 📝 Calificaciones | `GET /api/clases/3/notas` | Ver la planilla de notas |
| | `PUT /api/clases/3/notas` | Guardar notas |
| | `POST /api/clases/3/evaluaciones` | Crear una evaluación ("Parcial 1, 30%") |
| | `DELETE /api/evaluaciones/7` | Borrar una evaluación |
| ✅ Asistencia | `GET /api/clases/3/asistencia?fecha=2026-10-19` | Ver asistencia de un día |
| | `PUT /api/clases/3/asistencia` | Guardar asistencia |
| 📎 Material | `GET /api/material` | Ver material |
| | `POST /api/clases/3/material` · `DELETE /api/material/9` | Publicar / borrar |
| 📊 Reportes | `GET /api/panel` | Datos de la pantalla de inicio |
| | `GET /api/reportes/clases` | Resumen de todas las clases |
| | `GET /api/reportes/clases/3` | Reporte de notas de la clase 3 |
| | `GET /api/reportes/estudiantes/6` | Boletín del estudiante 6 |

### Probar la API sin la página 🧪

Tienes **Postman** instalado. Sirve para hacer pedidos al backend a mano:

1. Crea un pedido `POST` a `http://localhost:3000/api/auth/login`.
2. En **Body → raw → JSON** escribe:
   ```json
   { "email": "rector@nexo.edu.co", "contrasena": "nexo123" }
   ```
3. Pulsa **Send**. En la respuesta verás un `token` (capítulo 10 explica qué es). Cópialo.
4. Crea otro pedido `GET` a `http://localhost:3000/api/clases`.
5. En **Authorization → Bearer Token** pega el token y pulsa **Send**.

Verás la lista de clases en JSON, exactamente lo que recibe la página.

## Resumen

- Cada carpeta del backend es un **departamento** (módulo) con ventanillas y funcionarios.
- Los departamentos se **prestan** funcionarios con `exports` e `imports`.
- `app.module.ts` reúne a todos los departamentos.
- Los funcionarios **piden** lo que necesitan en el constructor y NestJS se lo da
  (inyección de dependencias).

➡️ Siguiente: [El backend y la base de datos](09-backend-y-base-de-datos.md)
