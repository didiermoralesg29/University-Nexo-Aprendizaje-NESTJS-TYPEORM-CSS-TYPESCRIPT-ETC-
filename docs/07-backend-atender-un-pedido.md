# 7. Cómo el backend atiende un pedido

Ya conoces la despensa (la base de datos). Ahora entramos a la **cocina**: el backend.
En este capítulo seguiremos **un solo pedido** de principio a fin: *el rector registra a un
estudiante*.

## 1. La oficina de registro 🏢

Imagina que vas a la oficina de registro de la universidad a inscribir a un estudiante:

1. Llegas a una **ventanilla**. La persona de la ventanilla recibe tu pedido.
2. Te pide llenar un **formulario** con reglas: "el nombre es obligatorio", "el correo debe
   tener @"… Si lo llenas mal, te lo devuelve sin pasarlo.
3. La ventanilla le pasa el formulario a un **funcionario**. Él hace el trabajo de verdad:
   revisa que el correo no esté repetido, crea la ficha y la guarda en el archivador.
4. Te devuelven una respuesta: "listo, quedó registrado".

En el código, cada uno de esos personajes es un **archivo**:

| En la oficina | Nombre en el código | Archivo |
|---|---|---|
| 🪟 La ventanilla | **Controlador** | `usuarios.controller.ts` |
| 📋 El formulario con reglas | **DTO** | `dto/crear-usuario.dto.ts` |
| 👷 El funcionario | **Servicio** | `usuarios.service.ts` |

> 💡 Si entiendes esta tabla, entiendes la idea central del backend. Todas las carpetas
> (clases, notas, asistencia…) tienen su ventanilla, sus formularios y su funcionario.

## 2. Primero: las etiquetas con `@` 🏷️

En el backend verás cosas como `@Controller`, `@Post` o `@IsEmail`. Son **etiquetas**, como un
sticker que le pegas a una caja para decir qué hay adentro:

```ts
@Post()            // ← sticker: "esto atiende pedidos de CREAR"
crear() { ... }
```

NestJS lee los stickers y sabe qué hacer con cada parte. Su nombre técnico es **decorador**.

## 3. Encender la oficina: `main.ts` 🔌

Antes de atender pedidos, la oficina tiene que **abrir**. Eso lo hace
`backend/src/main.ts`:

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule)   // 1. arma la oficina completa
  configurarApp(app)                                // 2. aplica los ajustes generales

  const puerto = app.get(ConfigService).get('PORT', 3000)
  await app.listen(puerto)                          // 3. abre la puerta 3000
  console.log(`API de Nexo University en http://localhost:${puerto}/api`)
}
```

1. Arma la oficina con todos sus departamentos (`AppModule`, capítulo 8).
2. Aplica los ajustes generales (ahora los vemos).
3. Abre la puerta número 3000 y empieza a esperar pedidos.

El mensaje del `console.log` es el que ves en la terminal cuando todo arrancó bien.

### Los ajustes generales: `configurar-app.ts`

```ts
app.setGlobalPrefix('api')
```
Todas las direcciones empiezan por `/api`. Por eso es `/api/usuarios` y no solo `/usuarios`.

```ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
```
Esto activa el **revisor automático de formularios** para todas las ventanillas. Lo verás en
acción en el paso 5.

## 4. Paso 1 — La ventanilla (controlador) 🪟

Archivo: `backend/src/usuarios/usuarios.controller.ts` (resumido)

```ts
@Controller('usuarios')     // esta ventanilla atiende la dirección /api/usuarios
export class UsuariosController {

  @Post()                                    // atiende pedidos de CREAR (POST)
  crear(@Body() datos: CrearUsuarioDto) {    // recibe el formulario lleno
    return this.usuariosService.crear(datos);    // y se lo pasa al funcionario
  }
}
```

Leamos línea por línea:

| Línea | Qué significa |
|---|---|
| `@Controller('usuarios')` | Sticker: "esta clase es la ventanilla de `/api/usuarios`" |
| `@Post()` | Sticker: "esta función atiende pedidos POST (crear)" |
| `@Body() datos` | "Toma los datos que vienen en el pedido y llámalos `datos`" |
| `: CrearUsuarioDto` | "Esos datos tienen la forma del formulario `CrearUsuarioDto`" |
| `return this.usuariosService.crear(datos)` | "Pásaselos al funcionario y devuelve lo que él responda" |

Fíjate: la ventanilla **no hace el trabajo**. Solo recibe y pasa. Así cada uno tiene una sola
tarea, y si mañana cambia la forma de registrar, solo se toca el funcionario.

### Los pedidos pueden traer datos de tres formas

| Dónde viene el dato | Ejemplo de pedido | Cómo lo toma la ventanilla |
|---|---|---|
| **En la dirección** | `GET /api/clases/3` (el 3) | `@Param('id') id` |
| **Después de un `?`** | `GET /api/usuarios?rol=profesor` | `@Query('rol') rol` |
| **En el cuerpo** (un formulario) | `POST /api/usuarios` con nombre, correo… | `@Body() datos` |

Regla simple:
- **En la dirección** → para decir **cuál** cosa (la clase número 3).
- **Después de `?`** → para **filtrar** o buscar (solo los profesores).
- **En el cuerpo** → para **enviar** datos al crear o editar.

Ejemplo con un número en la dirección:

```ts
@Get(':id')    // ":id" = aquí va un número que cambia: /api/usuarios/5, /api/usuarios/8…
buscar(@Param('id', ParseIntPipe) id: number) {
  return this.usuariosService.buscar(id);
}
```

`ParseIntPipe` convierte el texto `'5'` (todo lo que llega en una dirección es texto) en el
número `5`. Si alguien escribe `/api/usuarios/hola`, responde solo con error **400**.

## 5. Paso 2 — El formulario con reglas (DTO) 📋

Archivo: `backend/src/usuarios/dto/crear-usuario.dto.ts` (resumido)

```ts
export class CrearUsuarioDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsEmail({}, { message: 'Escribe un correo válido' })
  email: string;

  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena: string;

  @IsIn(['estudiante', 'profesor', 'rector'], { message: 'El rol debe ser estudiante, profesor o rector' })
  rol: string;
}
```

Cada sticker es una **regla** con su mensaje de error:

| Sticker | Revisa que… |
|---|---|
| `@IsNotEmpty` | no esté vacío |
| `@IsEmail` | sea un correo |
| `@MinLength(6)` | tenga al menos 6 letras |
| `@IsIn([...])` | sea uno de los valores permitidos |
| `@IsInt`, `@Min`, `@Max` | sea un número entero, dentro de un rango |
| `@IsOptional` | puede no venir (pero si viene, se revisa) |

Gracias al **revisor automático** que se activó en `configurar-app.ts`:

- Si el formulario rompe alguna regla, se **rechaza antes** de llegar al funcionario, con
  error **400** y los mensajes que escribimos:

  ```json
  { "message": ["El nombre es obligatorio", "Escribe un correo válido"] }
  ```

  Esos son los mensajes en rojo que ves en la página.

- Si alguien envía un dato que **no está** en el formulario (por ejemplo, un estudiante que
  intenta mandar `"rol": "rector"` al editar su perfil), también se rechaza. Así nadie se
  "cuela" cambios que no debería poder hacer.

> 💡 **DTO** son las siglas en inglés de "objeto para transportar datos". Para ti: **un
> formulario con reglas**.

## 6. Paso 3 — El funcionario (servicio) 👷

Archivo: `backend/src/usuarios/usuarios.service.ts` (versión simplificada)

```ts
async crear(datos: CrearUsuarioDto) {
  // 1. ¿Ya hay alguien con ese correo? Si sí, rechazar.
  const existe = await this.usuarios.existsBy({ email: datos.email });
  if (existe) {
    throw new ConflictException(`Ya existe un usuario con el correo ${datos.email}`);
  }

  // 2. Preparar la ficha nueva
  const usuario = this.usuarios.create({
    nombre: datos.nombre,
    email: datos.email,
    contrasena: /* la contraseña protegida (capítulo 10) */,
    rol: datos.rol,
  });

  // 3. Guardarla en la base de datos y devolverla
  return this.usuarios.save(usuario);
}
```

Aquí está la **lógica**: las decisiones que necesitan pensar o mirar los datos.

- `this.usuarios` es el **archivador** de la tabla `usuarios`. Cómo funciona exactamente lo
  verás en el capítulo 9; por ahora basta saber que `existsBy` pregunta "¿existe?",
  `create` prepara una ficha y `save` la guarda.
- `await` → espera a que la base de datos responda (capítulo 4: el pedido a domicilio).

### Cuando el funcionario dice que no 🚫

`throw` detiene todo y **rechaza** el pedido. La palabra que sigue decide el número de la
respuesta:

| Rechazo | Número | Cuándo se usa |
|---|---|---|
| `BadRequestException` | 400 | Los datos no tienen sentido |
| `UnauthorizedException` | 401 | No inició sesión |
| `ForbiddenException` | 403 | No tiene permiso |
| `NotFoundException` | 404 | No existe |
| `ConflictException` | 409 | Choca con algo que ya existe |

¿Por qué esta regla (correo repetido) está en el funcionario y no en el formulario? Porque
para saberlo **hay que mirar en la base de datos**. El formulario solo revisa lo que se ve a
simple vista (que no esté vacío, que tenga @…).

## 7. El recorrido completo

```
El rector pulsa "Registrar" en la página
        │
        ▼
POST /api/usuarios  { nombre: "Andrés", email: "andres@nexo.edu.co", ... }
        │
        ▼
🪟 Ventanilla (UsuariosController)
        │
        ▼
📋 Revisor de formularios (CrearUsuarioDto)
        │   ¿Falta el nombre? ¿Correo sin @? ──► ❌ 400 "Escribe un correo válido"
        ▼
👷 Funcionario (UsuariosService)
        │   ¿Correo repetido? ──────────────────► ❌ 409 "Ya existe un usuario con el correo…"
        │   Prepara la ficha y la guarda
        ▼
🗄️ Base de datos: nueva fila en la tabla "usuarios"
        │
        ▼
✅ 201 "Creado" { id: 18, nombre: "Andrés", codigo: "20260018", ... }
```

> En el capítulo 10 agregaremos un paso antes de la ventanilla: los **guardias**, que
> revisan que quien pide sea el rector.

## Resumen

- `main.ts` enciende el backend en la puerta 3000, y todas las direcciones empiezan por `/api`.
- Cada pedido llega a una **ventanilla** (controlador), que lo pasa al **funcionario**
  (servicio).
- Los datos se revisan con un **formulario con reglas** (DTO) antes de llegar al funcionario.
- El funcionario toma las decisiones y puede **rechazar** con un número de error.

➡️ Siguiente: [Los departamentos del backend](08-backend-departamentos.md)
