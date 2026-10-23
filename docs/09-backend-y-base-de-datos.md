# 9. El backend y la base de datos

En el capítulo 6 viste la base de datos (las tablas) y en los capítulos 7 y 8 viste cómo
trabaja el backend. Ahora vamos a **unirlos**: cómo el backend se conecta a la base de datos,
cómo se crean las tablas y cómo se guardan y buscan los datos.

## 1. Conectarse: la dirección y la llave 🔑

Para entrar a la base de datos, el backend necesita saber **dónde está** y tener la
**contraseña**. Esos datos están en `backend/.env`:

```env
DB_HOST=localhost          # en qué computadora está (esta misma)
DB_PUERTO=5432             # en qué puerta atiende PostgreSQL
DB_USUARIO=postgres        # con qué usuario entrar
DB_CONTRASENA=...          # la contraseña de PostgreSQL
DB_NOMBRE=nexo_university  # cuál base de datos usar
```

### ¿Por qué en un archivo aparte?

`.env` es una **caja fuerte** pequeña:
- Las contraseñas **no** se escriben dentro del código, porque el código se comparte (por
  ejemplo en GitHub) y todos las verían.
- `.env` está en la lista de cosas que Git **ignora** (capítulo 2), así que nunca se sube.
- Existe una copia **sin secretos**, `.env.example`, para que otra persona sepa qué debe llenar.

> ⚠️ Si cambias algo en `.env`, apaga el backend (`Ctrl + C`) y vuelve a encenderlo:
> el archivo solo se lee al arrancar.

El backend lee esos datos en `backend/src/config/base-datos.config.ts`:

```ts
host: config.get('DB_HOST', 'localhost'),       // "lee DB_HOST; si no está, usa localhost"
password: config.get('DB_CONTRASENA'),
database: config.get('DB_NOMBRE', 'nexo_university'),
```

## 2. TypeORM: el traductor 🗣️

PostgreSQL habla su propio idioma, llamado **SQL**. Por ejemplo, para buscar la clase número 3:

```sql
SELECT * FROM clases WHERE id = 3;
```

En vez de escribir SQL, usamos **TypeORM**: un **traductor** que entiende TypeScript y le habla
a PostgreSQL en SQL. Nosotros escribimos:

```ts
await this.clases.findOneBy({ id: 3 })
```

y TypeORM lo traduce solo.

## 3. Las plantillas de las fichas (entidades) 📄

¿Cómo sabe TypeORM qué tablas y columnas existen? Porque se las describimos con **clases**
(los moldes del capítulo 4) llenas de stickers. A cada una se le llama **entidad**.

Archivo: `backend/src/academico/asignatura.entity.ts`

```ts
@Entity('asignaturas')               // esta plantilla es la tabla "asignaturas"
export class Asignatura {
  @PrimaryGeneratedColumn()          // columna id que se numera sola: 1, 2, 3…
  id: number;

  @Column({ unique: true })          // columna de texto que no se puede repetir
  codigo: string;

  @Column()                          // columna de texto normal
  nombre: string;

  @Column({ type: 'int' })           // columna de número entero
  creditos: number;

  @ManyToOne(() => Programa, { nullable: true, eager: true })
  programa: Relation<Programa> | null;   // apunta a una carrera (o a ninguna)
}
```

Con esta plantilla, TypeORM crea esta tabla:

| id | codigo | nombre | creditos | programaId |
|---|---|---|---|---|
| 1 | IS101 | Programación I | 4 | 1 |
| 8 | TR001 | Comunicación Oral y Escrita | 2 | *(vacío)* |

Los stickers que más verás:

| Sticker | Significa |
|---|---|
| `@Entity('nombre')` | Esta clase es una tabla con este nombre |
| `@PrimaryGeneratedColumn()` | El número de ficha (id), automático |
| `@Column()` | Una columna |
| `@Column({ unique: true })` | Una columna que no se puede repetir (como el correo) |
| `@Column({ nullable: true })` | Una columna que puede quedar vacía |
| `@CreateDateColumn()` | Guarda sola la fecha en que se creó la fila |

### Los stickers de las relaciones (las flechas) 👉

En el capítulo 6 viste que las tablas se apuntan entre sí. En el código se escribe así:

| Sticker | Se lee | Ejemplo |
|---|---|---|
| `@ManyToOne` | "**Muchos** de estos apuntan a **uno** de aquellos" | Muchas clases → un profesor |
| `@OneToMany` | "**Uno** de estos tiene **muchos** de aquellos" (el otro lado) | Una clase → muchas inscripciones |

En `clase.entity.ts`:

```ts
@ManyToOne(() => Usuario, { eager: true })
profesor: Relation<Usuario>;     // cada clase tiene UN profesor

@OneToMany(() => Inscripcion, (inscripcion) => inscripcion.clase)
inscripciones: Relation<Inscripcion>[];   // cada clase tiene MUCHAS inscripciones (por eso [])
```

> 💡 `Relation<...>` es un pequeño envoltorio que TypeORM pide en proyectos como este para
> evitar enredos cuando dos fichas se apuntan mutuamente. Léelo simplemente como "apunta a".

### Opciones importantes en las relaciones

**`eager: true`** → "**tráelo siempre junto**". Cuando el backend busca una clase, trae
automáticamente su asignatura y su profesor, sin tener que pedirlos aparte. Como cuando pides
un combo: viene con papas y bebida incluidas.

**`onDelete: 'CASCADE'`** → "**si se borra el de arriba, borra los de abajo**". En
`inscripcion.entity.ts`:

```ts
@ManyToOne(() => Clase, ..., { onDelete: 'CASCADE' })
clase: Relation<Clase>;
```

Si se elimina una clase, sus inscripciones se borran solas (y con ellas sus notas y
asistencia). Así no quedan datos "huérfanos" apuntando a una clase que ya no existe.

**`@Unique([...])`** → "**esta combinación no se puede repetir**":

```ts
@Entity('inscripciones')
@Unique(['estudiante', 'clase'])     // un estudiante no puede estar 2 veces en la misma clase
export class Inscripcion { ... }
```

**`select: false`** → "**no lo muestres a menos que lo pida expresamente**". Se usa en la
contraseña, para que nunca se envíe por accidente al navegador:

```ts
@Column({ select: false })
contrasena: string;
```

## 4. ¿Quién crea las tablas? 🏗️

En `base-datos.config.ts` hay una línea clave:

```ts
synchronize: true,
```

Significa: *"cada vez que enciendas, compara las plantillas con las tablas, y **crea o ajusta**
lo que falte"*. Por eso nunca tuvimos que crear las tablas a mano: aparecieron solas la
primera vez.

> ⚠️ Es muy cómodo para aprender, pero en un sistema real (con datos importantes) se usa otra
> técnica llamada **migraciones**, porque `synchronize` podría borrar datos si cambias mucho
> una plantilla.

## 5. El archivador: guardar y buscar 🗄️

Cada funcionario recibe un **archivador** (técnicamente, un **repositorio**) por cada tabla
que necesita. Se pide en el constructor, como viste en el capítulo 8:

```ts
constructor(
  @InjectRepository(Clase) private readonly clases: Repository<Clase>,
) {}
```

Se lee: *"necesito el archivador de la tabla Clase, y lo voy a llamar `clases`"*.

Con el archivador puedes:

| Qué quieres | Cómo se escribe | Traducción |
|---|---|---|
| Buscar **una** por id | `this.clases.findOneBy({ id: 3 })` | "la clase número 3" |
| Buscar **varias** con condiciones | `this.clases.find({ where: { dia: 'Lunes' } })` | "las clases del lunes" |
| Buscar y **ordenar** | `this.clases.find({ order: { horaInicio: 'ASC' } })` | "todas, de la más temprano a la más tarde" |
| **Contar** | `this.inscripciones.countBy({ clase: { id: 3 } })` | "¿cuántos inscritos tiene la clase 3?" |
| ¿**Existe**? | `this.usuarios.existsBy({ email: 'x@nexo.edu.co' })` | "¿hay alguien con ese correo?" |
| **Preparar** una ficha nueva | `this.materiales.create({ titulo, enlace })` | (todavía no se guarda) |
| **Guardar** | `this.materiales.save(material)` | crea la fila, o la actualiza si ya existía |
| **Borrar** | `this.materiales.remove(material)` | elimina la fila |

`ASC` significa ascendente (de menor a mayor) y `DESC` descendente (de mayor a menor).

### Un ejemplo real completo

Así busca el backend las clases de un profesor (en `clases.service.ts`, simplificado):

```ts
const clases = await this.clases.find({
  where: { profesor: { id: usuario.id } },      // donde el profesor sea esta persona
  order: { dia: 'ASC', horaInicio: 'ASC' },     // ordenadas por día y hora
});
```

Se lee: *"busca en el archivador de clases las que tengan como profesor a esta persona, y
ordénalas por día y luego por hora"*. TypeORM sigue la flecha `profesor` (la relación) por ti.

## 6. Los datos de ejemplo: la semilla 🌱

Cuando el backend enciende, el departamento **Semilla** (`backend/src/semilla/`) pregunta:
*"¿hay usuarios en la base de datos?"*. Si **no** hay ninguno, crea los datos de ejemplo.

- `datos-semilla.ts` → la **lista** de datos: carreras, materias, profesores, estudiantes,
  horarios y material.
- `semilla.service.ts` → el **funcionario** que los guarda en orden: primero las carreras,
  luego las materias (que apuntan a carreras), luego los usuarios, luego las clases…
  ¡El orden importa! No puedes apuntar a una ficha que todavía no existe.

### Todo o nada: la transacción

La semilla guarda todo dentro de una **transacción**:

```ts
await this.dataSource.transaction((manager) => this.sembrar(manager));
```

Una transacción es una promesa de **"todo o nada"**. Como una transferencia bancaria: o se
descuenta de tu cuenta **y** llega a la otra, o no pasa ninguna de las dos. Si algo falla a
mitad de la semilla, se deshace todo y no quedan datos a medias.

### Reiniciar los datos

En `.env` hay una variable especial:

```env
DB_REINICIAR=false
```

Si la pones en `true`, el backend **borra todas las tablas** al encender (y la semilla las
vuelve a llenar). El atajo `npm run reiniciar-datos` hace eso por ti, sin tocar el `.env`.

## Resumen

- El backend se conecta a PostgreSQL con los datos guardados en `.env` (la caja fuerte).
- **TypeORM** traduce de TypeScript a SQL.
- Las **entidades** son plantillas que describen cada tabla; TypeORM crea las tablas con ellas.
- Las relaciones se escriben con `@ManyToOne` y `@OneToMany`.
- Cada funcionario usa **archivadores** (repositorios) para buscar, guardar y borrar.
- La **semilla** crea los datos de ejemplo dentro de una transacción ("todo o nada").

➡️ Siguiente: [Iniciar sesión y permisos](10-iniciar-sesion-y-permisos.md)
