# 6. La base de datos

Antes de ver cómo trabaja la cocina (el backend), conozcamos la **despensa**: dónde se guarda
la información. Así, cuando el backend "guarde" o "busque" algo, sabrás exactamente dónde.

## 1. Es como un libro de Excel 📊

Una base de datos se parece a un archivo de Excel con **varias hojas**:

| En Excel | En la base de datos |
|---|---|
| Una hoja | Una **tabla** |
| Una columna | Una **columna** (un tipo de dato: nombre, correo…) |
| Una fila | Una **fila** o **registro** (una ficha: un estudiante, una nota…) |

**Tabla `usuarios`** (resumida):

| id | nombre | email | rol | semestre |
|---|---|---|---|---|
| 1 | Laura Mendoza | rector@nexo.edu.co | rector | |
| 2 | Ana Gómez | ana.gomez@nexo.edu.co | profesor | |
| 6 | Sofía Martínez | sofia.martinez@nexo.edu.co | estudiante | 1 |

La columna **id** es el **número de ficha**. Cada fila tiene uno distinto y se pone solo
(1, 2, 3…). Sirve para identificar a cada uno sin confusión, aunque dos personas se llamen
igual.

Las casillas vacías (como el semestre del rector) guardan `null`: "aquí no hay nada", como
viste en el capítulo 3.

## 2. ¿Por qué no Excel?

Usamos un programa llamado **PostgreSQL** porque:
- **Muchas personas** pueden leer y escribir a la vez sin dañar nada.
- Puede guardar **millones** de filas sin ponerse lento.
- **Protege** los datos con reglas: por ejemplo, no permite dos usuarios con el mismo correo.
- Los datos quedan guardados en el disco: **no se pierden** al apagar la computadora.

## 3. Tablas que se apuntan entre sí 👉

Imagina guardar todo en una sola hoja:

| estudiante | materia | profesor | día | nota |
|---|---|---|---|---|
| Sofía | Programación I | Ana Gómez | Lunes | 3.6 |
| Mateo | Programación I | Ana Gómez | Lunes | 4.3 |
| Sofía | Bases de Datos | Ana Gómez | Jueves | 3.5 |

Si la profesora Ana se cambia el apellido, ¡tendrías que corregirlo en **cientos** de filas! Y
si te olvidas de una, los datos quedan mezclados.

La solución: **cada cosa en su propia tabla**, y las tablas **se apuntan** usando el id.

**Tabla `usuarios`**

| id | nombre |
|---|---|
| **2** | Ana Gómez |

**Tabla `clases`**

| id | asignatura | profesorId | día |
|---|---|---|---|
| 1 | Programación I | **2** | Lunes |
| 3 | Bases de Datos | **2** | Jueves |

`profesorId = 2` significa: *"el profesor de esta clase es la persona con la ficha número 2"*.
Si Ana cambia su nombre, se corrige **en un solo lugar**.

> 💡 A esto se le llama **relación**: en vez de copiar los datos, dices "**ver ficha número
> 2**". Es como cuando un libro dice "ver página 45".

## 4. Las 9 tablas de Nexo University

| Tabla | Guarda | Apunta a… |
|---|---|---|
| `programas` | Las carreras (Ingeniería de Sistemas…) | — |
| `asignaturas` | Las materias (Programación I, 4 créditos…) | su carrera |
| `usuarios` | Estudiantes, profesores y rector | su carrera (si es estudiante) |
| `clases` | Un **grupo** de una materia: horario, salón, cupo | su materia y su profesor |
| `inscripciones` | Qué estudiante está en qué clase | el estudiante y la clase |
| `evaluaciones` | "Parcial 1 (30%)", "Examen final (40%)"… | su clase |
| `notas` | La nota de un estudiante en una evaluación | la inscripción y la evaluación |
| `asistencias` | Si un estudiante vino a clase un día | la inscripción |
| `materiales` | Enlaces de estudio | su clase |

### ¿Por qué "clase" y "asignatura" son cosas distintas?

- La **asignatura** es la materia en el plan de estudios: *"Programación I, 4 créditos"*.
- La **clase** es un **grupo concreto** de esa materia: *"Programación I, grupo A, lunes de 7 a 9,
  salón B-201, con la profesora Ana"*.

Una misma asignatura puede tener varias clases (grupo A el lunes, grupo B el sábado…).

### ¿Por qué existe la tabla "inscripciones"?

Un estudiante tiene **muchas** clases, y una clase tiene **muchos** estudiantes. Para anotar
"quién está en dónde" se usa una tabla en el medio, como una **lista de asistencia oficial**:

| id | estudianteId | claseId |
|---|---|---|
| 1 | 6 (Sofía) | 1 (Programación I) |
| 2 | 6 (Sofía) | 2 (Cálculo) |
| 3 | 7 (Mateo) | 1 (Programación I) |

Las notas y la asistencia se cuelgan de la inscripción, porque son *"de Sofía **en**
Programación I"*.

### Un ejemplo siguiendo las flechas

¿Cuál es la nota de Sofía en el Parcial 1 de Programación I?

```
usuarios           inscripciones            notas                    evaluaciones
Sofía (id 6)  ──►  Sofía en clase 1   ──►  inscripción 1,      ──►  Parcial 1 (30%)
                   (id 1)                   evaluación 1: 3.6        de la clase 1
```

El sistema sigue las flechas, como quien sigue pistas.

## 5. Reglas que protege la base de datos 🛡️

La base de datos no deja guardar cosas que no tienen sentido:

| Regla | Ejemplo |
|---|---|
| **Único** | No puede haber dos usuarios con el mismo correo |
| **No repetir combinaciones** | Un estudiante no puede inscribirse dos veces en la misma clase |
| **Borrado en cadena** | Si se borra una clase, se borran sus inscripciones, notas y asistencia (no quedan "huérfanas") |
| **Protección** | No se puede borrar una asignatura si tiene clases |

## 6. Ver los datos con tus propios ojos 👀

PostgreSQL trae un programa llamado **pgAdmin**:

1. Abre **pgAdmin** desde el menú de Windows.
2. A la izquierda: **Servers → PostgreSQL 18** (te pedirá tu contraseña de PostgreSQL).
3. **Databases → nexo_university → Schemas → public → Tables**.
4. Clic derecho en una tabla (por ejemplo `usuarios`) → **View/Edit Data → All Rows**.

Verás la tabla como en Excel.

🧪 **Prueba:** entra a la página como rector, registra un estudiante nuevo, y luego en pgAdmin
vuelve a abrir la tabla `usuarios`. ¡Aparecerá la fila nueva!

## 7. Los datos de ejemplo 🌱

La primera vez que se enciende el backend con la base de datos vacía, se crean solos unos
datos para probar: 3 carreras, 8 materias, el rector, 4 profesores, 12 estudiantes, 8 clases,
notas, asistencia de las últimas 4 semanas y material. A esto lo llamamos la **semilla**.

Si algún día quieres **borrar todo y volver a empezar** con esos datos:

```bash
npm run reiniciar-datos
```

⚠️ Esto borra todo lo que hayas creado tú.

## Resumen

- La base de datos guarda la información en **tablas** (como hojas de Excel).
- Cada fila tiene un **id** único.
- Las tablas se **apuntan** entre sí con ids (relaciones), para no repetir datos.
- Nexo tiene 9 tablas. La más importante para entender es **inscripciones**: une estudiantes
  con clases, y de ella cuelgan notas y asistencia.
- Puedes ver los datos con **pgAdmin**.

➡️ Siguiente: [Cómo el backend atiende un pedido](07-backend-atender-un-pedido.md)
