# 11. Las reglas de la universidad

Este es el último capítulo del backend. Ya sabes **dónde** se toman las decisiones (en los
funcionarios). Ahora veremos **cuáles** son esas decisiones: cómo se calculan las notas, la
asistencia, los promedios y qué cosas el sistema no deja hacer.

Las reglas de cálculo están juntas en un solo archivo:
**`backend/src/comun/calculos.ts`**. Si cambias un número ahí, cambia en todo el sistema.

```ts
export const NOTA_MINIMA = 0;
export const NOTA_MAXIMA = 5;
export const NOTA_APROBACION = 3.0;
export const ASISTENCIA_MINIMA = 80;   // porcentaje
```

> 💡 Se escriben en MAYÚSCULAS porque son **constantes**: valores fijos que no cambian
> mientras el programa funciona. Así es fácil encontrarlos.

---

## 1. Las notas 📝

- Las notas van de **0.0 a 5.0** (como en las universidades colombianas).
- Se aprueba con **3.0** o más.

### Cada evaluación vale un porcentaje

El profesor crea las **evaluaciones** de su clase, cada una con un peso. Ejemplo:

| Evaluación | Vale | Nota de Sofía | Cuánto aporta |
|---|---|---|---|
| Parcial 1 | 30% | 4.0 | 4.0 × 0.30 = **1.2** |
| Parcial 2 | 30% | 3.0 | 3.0 × 0.30 = **0.9** |
| Examen final | 40% | 5.0 | 5.0 × 0.40 = **2.0** |
| | **100%** | **Nota definitiva** | 1.2 + 0.9 + 2.0 = **4.1** ✅ |

Se multiplica cada nota por su porcentaje y se suma todo.

### El problema de la mitad del semestre

Imagina que solo se han hecho los dos parciales (el 60%). La definitiva solo suma esos dos:

```
1.2 + 0.9 = 2.1     ← ¡parece que va perdiendo! Pero todavía falta el 40%
```

Por eso mostramos **dos números**:

| Número | Responde a… | En el ejemplo |
|---|---|---|
| **Definitiva** (acumulada) | ¿Cuántos puntos llevo ganados? | 2.1 |
| **Promedio actual** | ¿Cómo me está yendo en lo que ya se evaluó? | 3.5 |

El promedio actual es: lo acumulado dividido entre lo evaluado.
`2.1 ÷ 0.60 = 3.5`. Responde: *"si sigo así, ¿apruebo?"*.

Si el promedio actual es **menor a 3.0**, el estudiante aparece como **"en riesgo"** en los
reportes del profesor.

### El código que lo calcula

`calcularDefinitiva` en `calculos.ts` (simplificado):

```ts
export function calcularDefinitiva(items) {
  let acumulado = 0
  let porcentajeEvaluado = 0
  for (const item of items) {           // por cada evaluación…
    if (item.valor === null) continue    // si no tiene nota todavía, sáltala
    acumulado += (item.valor * item.porcentaje) / 100   // suma lo que aporta
    porcentajeEvaluado += item.porcentaje               // y cuenta su porcentaje
  }
  return {
    definitiva: redondear(acumulado),
    promedioActual: porcentajeEvaluado > 0 ? redondear((acumulado * 100) / porcentajeEvaluado) : null,
    porcentajeEvaluado,
  }
}
```

Palabras nuevas:
- `for (const item of items)` → "**por cada** item de la lista, haz esto". Es una repetición.
- `continue` → "sáltate este y sigue con el siguiente".
- `+=` → "súmale a lo que ya había". `acumulado += 1.2` es lo mismo que
  `acumulado = acumulado + 1.2`.

### El estado de la materia

| Estado | Cuándo |
|---|---|
| 🔵 **En curso** | Todavía no se ha evaluado el 100% |
| 🟢 **Aprobada** | Se evaluó todo, la definitiva es 3.0 o más **y** la asistencia es 80% o más |
| 🔴 **Reprobada** | Se evaluó todo, y la definitiva es menor a 3.0 **o** la asistencia es menor a 80% |

```ts
export function estadoMateria(definitiva, porcentajeEvaluado, asistencia) {
  if (porcentajeEvaluado < 100) return 'En curso'
  if (asistencia !== null && asistencia < ASISTENCIA_MINIMA) return 'Reprobada'
  return definitiva >= NOTA_APROBACION ? 'Aprobada' : 'Reprobada'
}
```

Se lee de arriba hacia abajo, y la primera condición que se cumpla decide:
1. ¿Falta evaluar? → En curso.
2. ¿Faltó a demasiadas clases? → Reprobada.
3. Si no, ¿tiene 3.0 o más? → Aprobada; si no, Reprobada.

## 2. La asistencia ✅

- El profesor marca, cada día de clase, quién vino.
- El porcentaje es: **clases a las que vino ÷ clases registradas × 100**.
  Ejemplo: vino a 9 de 12 → 9 ÷ 12 × 100 = **75%**.
- Se necesita **mínimo 80%**. Si faltas a más del 20%, **pierdes la materia aunque tengas buenas
  notas**. En las universidades se le llama "**pérdida por fallas**".

En los datos de ejemplo, **Santiago Ramírez** falta mucho a propósito, para que veas la alerta
en rojo.

## 3. El promedio de todas las materias 🎓

No todas las materias pesan igual: las que tienen más **créditos** (más horas de trabajo)
pesan más. A esto se le llama **promedio ponderado**.

| Materia | Créditos | Nota | Nota × créditos |
|---|---|---|---|
| Programación I | 4 | 4.0 | 16 |
| Comunicación Oral | 2 | 3.0 | 6 |
| **Total** | **6** | | **22** |

Promedio = 22 ÷ 6 = **3.67**

Si fuera un promedio normal sería (4.0 + 3.0) ÷ 2 = 3.5. Programación I sube el promedio
porque tiene el doble de créditos.

---

## 4. Reglas que el sistema hace cumplir 🛡️

Estas reglas no son cálculos: son cosas que el sistema **no deja hacer**. Cada una vive en el
funcionario del departamento correspondiente, y rechaza el pedido con un mensaje.

### Inscribir materias (`clases.service.ts` → `inscribir`)

| El sistema no deja… | Respuesta |
|---|---|
| Inscribir dos materias **a la misma hora** | ❌ 409 *"Se cruza con Programación I (Lunes 07:00-09:00)"* |
| Inscribir una clase **llena** | ❌ 409 *"La clase no tiene cupos disponibles"* |
| Inscribir la misma clase **dos veces** | ❌ 409 *"El estudiante ya está inscrito"* |
| Inscribir a un estudiante **desactivado** | ❌ 400 |

#### ¿Cómo sabe si dos horarios se cruzan?

Con la función `seCruzan` en `backend/src/comun/horarios.ts`:

```ts
export function seCruzan(a, b) {
  return a.dia === b.dia && a.horaInicio < b.horaFin && b.horaInicio < a.horaFin
}
```

Se cruzan si son **el mismo día** y una empieza **antes** de que termine la otra (y viceversa).

| Clase A | Clase B | ¿Se cruzan? |
|---|---|---|
| Lunes 7:00–9:00 | Lunes 8:00–10:00 | ✅ Sí (de 8 a 9 están las dos) |
| Lunes 7:00–9:00 | Lunes 9:00–11:00 | ❌ No (una termina justo cuando empieza la otra) |
| Lunes 7:00–9:00 | Martes 7:00–9:00 | ❌ No (días distintos) |

### Crear y editar clases (`clases.service.ts` → `validarHorario`)

| El sistema no deja… |
|---|
| Que un profesor tenga **dos clases a la misma hora** (usa la misma función `seCruzan`) |
| Que la clase termine **antes** de empezar (por ejemplo, de 10:00 a 9:00) |
| Bajar el cupo por debajo de los estudiantes que ya están inscritos |
| Que un profesor cambie el profesor de una clase (solo el rector puede) |

El **periodo** se pone solo según la fecha (`periodoActual` en `horarios.ts`):
de enero a junio es `2026-1`, de julio a diciembre es `2026-2`.

### Notas y evaluaciones (`calificaciones.service.ts`)

| El sistema no deja… |
|---|
| Que los porcentajes de una clase **sumen más de 100%** |
| Guardar notas menores a 0 o mayores a 5 |
| Guardar notas de estudiantes o evaluaciones que **no son de esa clase** (por si alguien hace trampa desde el navegador) |

Si se borra una evaluación, se borran también sus notas (el "borrado en cadena" del capítulo 9).

### Asistencia (`asistencia.service.ts`)

| El sistema no deja… |
|---|
| Registrar asistencia de una **fecha futura** |

Si ya había asistencia registrada ese día, se **reemplaza** (así el profesor puede corregir).

### Usuarios (`usuarios.service.ts`)

| Regla |
|---|
| Dos personas no pueden tener el **mismo correo** |
| Dos estudiantes no pueden tener el **mismo código** |
| Un estudiante **debe** tener una carrera |
| Si no se escribe el código del estudiante, se crea solo: año + número (por ejemplo `20260013`) |
| Un usuario **desactivado** no puede iniciar sesión, pero sus notas **no se borran** |

---

## 5. Cuentas para probar 🔑

Todas tienen la contraseña **`nexo123`**:

| Quién | Correo |
|---|---|
| Rector (Laura Mendoza) | `rector@nexo.edu.co` |
| Profesora (Ana Gómez) | `ana.gomez@nexo.edu.co` |
| Otros profesores | `carlos.ruiz@nexo.edu.co`, `maria.lopez@nexo.edu.co`, `jorge.diaz@nexo.edu.co` |
| Estudiante (Sofía Martínez) | `sofia.martinez@nexo.edu.co` |
| Estudiante que falta mucho | `santiago.ramirez@nexo.edu.co` |

🧪 **Prueba las reglas tú mismo:**
- **Cruce de horario:** como **Rector**, crea una clase el **lunes de 08:00 a 10:00** con el
  profesor Carlos Ruiz. Luego entra como **Sofía** → *Inscribir materias* e intenta
  inscribirla. Como Sofía tiene Programación I el lunes de 7:00 a 9:00, verás el error.
- **Nota inválida:** como **Ana**, abre Programación I → pestaña *Notas*, escribe un `7` en
  alguna casilla y pulsa *Guardar notas*.
- **Porcentajes:** en esa misma pestaña, fíjate que el botón *Agregar* de "Nueva evaluación"
  está **desactivado**: ya se usó el 100%. Borra una evaluación (la ✕) y se activará.

## Resumen

- Las reglas de cálculo están en `comun/calculos.ts` y las de horarios en `comun/horarios.ts`.
- **Definitiva** = puntos acumulados; **promedio actual** = cómo vas con lo evaluado.
- Se aprueba con 3.0 **y** 80% de asistencia.
- El promedio de todas las materias pesa más las que tienen más créditos.
- Los funcionarios de cada departamento rechazan lo que no tiene sentido (cruces de horario,
  cupos llenos, porcentajes de más de 100%…).

🎉 ¡Terminaste la parte del backend!

➡️ Siguiente: [Las piezas de la pantalla](12-frontend-piezas.md)
