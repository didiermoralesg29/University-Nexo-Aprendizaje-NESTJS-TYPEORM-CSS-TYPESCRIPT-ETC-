# 10. Iniciar sesión y permisos

Ya sabes cómo el backend atiende pedidos y guarda datos. Pero falta algo muy importante:
**¿quién está pidiendo?** No es lo mismo que el rector pida "registrar un estudiante" a que
lo pida un estudiante.

Cada vez que llega un pedido, el sistema necesita responder dos preguntas:

| Pregunta | Nombre técnico | Si falla |
|---|---|---|
| 1. ¿**Quién** eres? | Autenticación | ❌ 401 |
| 2. ¿**Puedes** hacer esto? | Autorización (permisos) | ❌ 403 |

Este capítulo explica cómo se responde cada una, paso a paso.

---

## Parte A: ¿Quién eres?

### 1. Las contraseñas se guardan "licuadas" 🥤

Guardar las contraseñas tal cual sería peligroso: si alguien robara la base de datos, vería
la contraseña de todos.

Por eso se hace algo parecido a una **licuadora**:

- Si metes una fresa 🍓, sale jugo de fresa 🥤.
- Pero con el jugo **no puedes volver a armar la fresa**.

La contraseña `nexo123` se "licúa" y en la base de datos queda guardado algo así:

```
$2b$10$Xk9aQe7Lr0vN3sB1mZy...p2
```

Con ese revuelto **nadie** puede saber la contraseña original. Ni siquiera tú mirando en pgAdmin.

**¿Y cómo se revisa al iniciar sesión?** Se licúa lo que escribiste y se compara el jugo: si
sale igual al guardado, la contraseña es correcta. 🍓 + 🍓 = 🥤 igual.

En el código (con la herramienta **bcrypt**):

```ts
// Al registrar (usuarios.service.ts): licuar y guardar
contrasena: await bcrypt.hash(datos.contrasena, 10)

// Al iniciar sesión (auth.service.ts): ¿el jugo coincide?
await bcrypt.compare(contrasenaEscrita, usuario.contrasena)   // true (sí) o false (no)
```

> 💡 Al "jugo" se le llama **hash**. El número `10` indica qué tanto se licúa (más alto = más
> seguro pero más lento).

### 2. Al iniciar sesión te dan una manilla 🎟️

¿Has ido a un concierto o a un parque de diversiones? En la entrada muestras tu cédula **una
sola vez**, y te ponen una **manilla**. Después, en cada atracción, solo muestras la manilla.

Nexo University hace lo mismo:

```
1. Escribes tu correo y contraseña           →  "Aquí está mi cédula"
2. El backend busca tu usuario y compara      →  "Sí eres tú"
   la contraseña licuada
3. El backend te da una MANILLA               →  "Usa esto de ahora en adelante"
4. El navegador guarda la manilla
5. En cada pedido, el navegador la muestra    →  "Quiero ver mis notas. Aquí está mi manilla"
```

La ventanilla de inicio de sesión (`auth.controller.ts`):

```ts
@Publico()                // ← cualquiera puede usar esta ventanilla (sin manilla)
@Post('login')
login(@Body() datos: LoginDto) {
  return this.authService.login(datos.email, datos.contrasena);
}
```

Y el funcionario (`auth.service.ts`, simplificado):

```ts
async login(email, contrasena) {
  const usuario = await this.usuariosService.buscarConContrasena(email);

  const valida = usuario !== null
              && usuario.activo
              && (await bcrypt.compare(contrasena, usuario.contrasena));
  if (!valida) {
    throw new UnauthorizedException('Correo o contraseña incorrectos');
  }

  const token = await this.jwt.signAsync({ sub: usuario.id, rol: usuario.rol, nombre: usuario.nombre });
  return { token, usuario };
}
```

Fíjate en tres detalles:

1. La contraseña es correcta **solo si** el usuario existe **y** está activo **y** la
   contraseña coincide (los `&&` del capítulo 3). Por eso un usuario **desactivado** no puede
   entrar.
2. El mensaje de error es **siempre el mismo**: *"Correo o contraseña incorrectos"*. No dice
   cuál de los dos falló. Así nadie puede averiguar qué correos existen probando.
3. `signAsync` es el que **fabrica la manilla**.

### 3. ¿Qué es la manilla exactamente? 🔏

Se llama **token** (y el tipo que usamos se llama **JWT**). Es un texto largo:

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjYsInJvbCI6ImVzdHVkaWFudGUifQ.4kX9aB...
     cabecera                 contenido                       sello
```

- El **contenido** dice quién eres: *"usuario número 6, rol estudiante, Sofía Martínez"*.
- El **sello** (firma) se hace con una **clave secreta** que solo conoce el backend. Está en
  `backend/.env` y se llama `JWT_SECRETO`.

**¿Y si alguien falsifica la manilla?** Si alguien cambia "estudiante" por "rector" en su
manilla, el sello ya no coincide y el backend la rechaza. Es como un billete: puedes
fotocopiarlo, pero no tiene los sellos de seguridad.

> ⚠️ Por eso `JWT_SECRETO` **nunca** se comparte. Quien la conozca podría fabricar manillas
> falsas de rector.

> ⚠️ El contenido de la manilla **se puede leer** (no está escondido, solo sellado). Por eso
> nunca se pone la contraseña dentro.

**La manilla vence ⏰** a las **8 horas** (`expiresIn: '8h'` en `auth.module.ts`). Después hay
que iniciar sesión otra vez. Si vence mientras usas la página, verás *"Tu sesión expiró"*.

---

## Parte B: ¿Puedes hacer esto?

### 4. Los guardias de seguridad 💂

Recuerda el recorrido de un pedido del capítulo 7. Ahora le agregamos **dos guardias** antes
de la ventanilla. Revisan **todos** los pedidos, de todos los departamentos:

```
Pedido "registrar un estudiante" (con manilla)
     │
     ▼
💂 Guardia 1 (AutenticacionGuard): "¿Traes manilla? ¿Es auténtica? ¿No ha vencido?"
     │    No → ❌ 401 "Debes iniciar sesión"
     │    Sí → anota quién eres: "es Laura, rector"
     ▼
💂 Guardia 2 (RolesGuard): "¿Tu rol puede entrar a esta ventanilla?"
     │    No → ❌ 403 "No tienes permiso para hacer esto"
     ▼
🪟 Ventanilla → 📋 Formulario → 👷 Funcionario → 🗄️ Base de datos
```

Los guardias están en `backend/src/auth/guards/`. Se registran para **todo** el backend en
`auth.module.ts`:

```ts
providers: [
  { provide: APP_GUARD, useClass: AutenticacionGuard },   // guardia 1 en todas las puertas
  { provide: APP_GUARD, useClass: RolesGuard },           // guardia 2 en todas las puertas
],
```

> 💡 Como los guardias están en **todas** las puertas, por defecto **todo está protegido**.
> La única puerta abierta es la de iniciar sesión, porque tiene el sticker `@Publico()`.
> Es más seguro así: si se te olvida proteger una ventanilla nueva, ya está protegida.

### 5. Cómo dice cada ventanilla quién puede pasar 🏷️

Con el sticker `@Roles`:

```ts
@Roles('profesor', 'rector')    // solo profesores y el rector
@Post()
crear(...) { ... }
```

Puede ir encima de **una** función o encima de **toda** la ventanilla. Por ejemplo, la
ventanilla de usuarios es completa solo para el rector:

```ts
@Roles('rector')                // toda esta ventanilla es solo para el rector
@Controller('usuarios')
export class UsuariosController { ... }
```

Si una función **no** tiene `@Roles`, puede usarla **cualquiera que tenga manilla** (por
ejemplo, ver tus clases).

### 6. "Solo tu salón" 🚪

El guardia 2 deja pasar a **cualquier** profesor a la ventanilla de notas. Pero la profesora
Ana **no** debería poner notas en la clase del profesor Jorge.

El guardia no puede saberlo, porque para eso hay que **mirar los datos** ("¿de quién es esta
clase?"). Por eso esa revisión la hace el funcionario de **Clases**
(`backend/src/clases/clases.service.ts`):

```ts
puedeGestionar(clase, usuario) {
  return (
    usuario.rol === 'rector' ||                                       // el rector puede todo
    (usuario.rol === 'profesor' && clase.profesor.id === usuario.id)  // el profesor, solo lo suyo
  );
}
```

Se lee: *"puede gestionar la clase **si** es rector, **o** si es profesor **y** el profesor de
la clase es él mismo"*.

Y hay dos funciones que usan esa regla:

| Función | Deja pasar a… | La usan |
|---|---|---|
| `buscarParaGestionar` | Rector o el profesor de esa clase | Notas, asistencia, material, reportes, editar clase |
| `buscarParaVer` | Los anteriores **y** los estudiantes inscritos | Ver una clase |

Si no cumple, responden **403**. Esto es lo que te contaba en el capítulo 8: la regla está
**una sola vez** en Clases, y los demás departamentos la piden prestada.

### 7. ¿Cómo sabe la ventanilla quién soy? 🪪

El guardia 1 anota quién eres en el pedido. La ventanilla lo lee con el sticker
`@UsuarioActual()`:

```ts
@Get()
listar(@UsuarioActual() usuario: UsuarioSesion) {
  return this.clasesService.listar(usuario);
}
```

Así, el mismo pedido `GET /api/clases` devuelve cosas distintas según quién lo haga:

| Quién pide | Recibe |
|---|---|
| Rector | Todas las clases |
| Profesor | Las clases que dicta |
| Estudiante | Las clases en las que está inscrito |

### 8. Esconder botones NO es seguridad ⚠️

En la página, cada rol ve un menú distinto (el estudiante no ve "Estudiantes", por ejemplo).
Pero eso es solo **comodidad**, como quitar el letrero de una puerta: la puerta sigue ahí.

Una persona con conocimientos podría modificar la página en su propio navegador y hacer
aparecer el botón. ¿Qué pasaría? Nada: al hacer el pedido, los **guardias del backend** lo
rechazarían.

> 💡 Regla de oro de la seguridad: **nunca confíes en lo que llega del navegador**. Todo se
> revisa en el backend.

---

## Tabla de permisos completa

| Acción | Estudiante | Profesor | Rector |
|---|:-:|:-:|:-:|
| Iniciar sesión, ver su perfil, cambiar teléfono o contraseña | ✅ | ✅ | ✅ |
| Ver su horario / sus clases | ✅ inscritas | ✅ las que dicta | ✅ todas |
| Inscribir y cancelar materias | ✅ las suyas | ❌ | ✅ de cualquiera |
| Ver su boletín de notas | ✅ solo el suyo | ❌ | ✅ de cualquiera |
| Ver material | ✅ de sus clases | ✅ de sus clases | ✅ todo |
| **Crear una clase** | ❌ | ✅ a su nombre | ✅ eligiendo el profesor |
| Editar o eliminar una clase | ❌ | ✅ las suyas | ✅ |
| Cambiar el profesor de una clase | ❌ | ❌ | ✅ |
| **Tomar asistencia** | ❌ | ✅ sus clases | ✅ |
| **Agregar notas** y evaluaciones | ❌ | ✅ sus clases | ✅ |
| Publicar o borrar material | ❌ | ✅ sus clases | ✅ |
| **Generar reporte de notas** | ❌ | ✅ sus clases | ✅ |
| **Registrar y editar estudiantes** y profesores | ❌ | ❌ | ✅ |
| Crear carreras y asignaturas | ❌ | ❌ | ✅ |

## Resumen

- Las contraseñas se guardan **licuadas** (hash) con bcrypt: nadie puede leerlas.
- Al iniciar sesión recibes una **manilla sellada** (token JWT) que vence en 8 horas.
- Dos **guardias** revisan cada pedido: ¿tienes manilla válida? (401) ¿tu rol puede? (403).
- `@Roles(...)` dice qué roles pueden usar una ventanilla; `@Publico()` la abre para todos.
- La regla "solo tus clases" está en `ClasesService` y la usan varios departamentos.
- Esconder botones en la página es comodidad; la seguridad real está en el backend.

➡️ Siguiente: [Las reglas de la universidad](11-las-reglas-de-la-universidad.md)
