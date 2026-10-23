# 16. Ejercicios

¡Hora de practicar! Los ejercicios van **de fácil a difícil**, y cada uno usa lo que aprendiste
en un capítulo. Ten `npm run dev` encendido y la página abierta mientras trabajas.

> 💡 **Método para aprender:** antes de cambiar algo, mira cómo se ve. Cambia **una sola
> cosa**, guarda (`Ctrl + S`) y mira qué cambió. Así entiendes qué hace cada línea.

> 💡 Si dañas algo y no sabes cómo arreglarlo, pídeme ayuda o usa Git para volver atrás.

---

## Nivel 1 ⭐ — Cambiar cosas que se ven

### Ejercicio 1: el color de la universidad
📖 *Capítulo 14 (variables de CSS)*

**Archivo:** `frontend/src/estilos.css`

1. Busca la línea `--color-primario: #1d3f8f;` (está al principio, línea 6).
2. Cámbiala por `--color-primario: #7c3aed;` (morado).
3. Guarda. Mira la página: la barra, los botones y el menú ahora son morados.
4. **Reto:** cambia también `--color-primario-oscuro` por `#5b21b6` y pasa el mouse por un
   botón.

### Ejercicio 2: un texto del login
📖 *Capítulo 12 (JSX)*

**Archivo:** `frontend/src/paginas/Login.tsx`

1. Busca el texto `Plataforma académica`.
2. Cámbialo por `Bienvenido a tu universidad`.
3. Guarda, cierra sesión con **Salir** y mira la pantalla de inicio.

### Ejercicio 3: el nombre de una opción del menú
📖 *Capítulo 12 (el menú cambia según el rol)*

**Archivo:** `frontend/src/componentes/Layout.tsx`

1. Busca `{ a: '/mis-notas', texto: 'Mis notas' }`.
2. Cambia `'Mis notas'` por `'Mis calificaciones'`.
3. Entra como **Estudiante** y mira el menú.
4. **Pregunta:** ¿por qué el profesor no ve ese cambio? (Pista: mira las tres listas `MENU`.)

---

## Nivel 2 ⭐⭐ — Cambiar reglas y datos

### Ejercicio 4: cambiar la nota para aprobar
📖 *Capítulo 11 (reglas) y capítulo 15 (pruebas)*

**Archivo:** `backend/src/comun/calculos.ts`

1. Busca `export const NOTA_APROBACION = 3.0;` y cámbialo a `3.5`.
2. Guarda. Espera a que en la terminal salga `Found 0 errors`.
3. Ejecuta `npm test` en **otra** terminal (Terminal → New Terminal).
4. ¿Falla alguna prueba? Lee el mensaje: dice qué **esperaba** y qué **recibió**. ¿Por qué
   falló?
5. **Devuelve el valor a `3.0`** y ejecuta `npm test` otra vez: todo debe pasar.

> 💡 Acabas de ver para qué sirven las pruebas: te avisan cuando un cambio afecta algo.

### Ejercicio 5: ver el teléfono en la lista de estudiantes
📖 *Capítulo 12 (map y JSX) y capítulo 3 (`??`)*

**Archivo:** `frontend/src/paginas/ListaUsuarios.tsx`

1. Busca `<th>Correo</th>` (son los **títulos** de las columnas).
2. Justo debajo agrega: `<th>Teléfono</th>`
3. Busca `<td>{u.email}</td>` (son los **datos** de cada fila).
4. Justo debajo agrega: `<td>{u.telefono ?? '—'}</td>`
5. Entra como **Rector** → **Estudiantes**.

`u.telefono ?? '—'` se lee: *"el teléfono, y si no tiene, una rayita"*.

### Ejercicio 6: un tipo de material nuevo
📖 *Capítulo 9 (entidades) y capítulo 13 (tipos.ts: el frontend y el backend deben estar de acuerdo)*

Hoy el material puede ser PDF, Video, Presentación o Enlace. Agrega **Libro**. Hay que
cambiarlo en **tres** lugares:

1. **Backend** — `backend/src/material/material.entity.ts`: en la lista `TIPOS_MATERIAL`,
   agrega `'Libro',` después de `'Enlace',`.
2. **Frontend** — `frontend/src/api/tipos.ts`: en la línea de `TipoMaterial`, agrega
   ` | 'Libro'` al final.
3. **Frontend** — `frontend/src/paginas/clase/PestanaMaterial.tsx`: en la lista `TIPOS`,
   agrega `'Libro'`.

Luego entra como **Profesor** → **Mis clases** → una clase → pestaña **Material** y publica un
libro (puedes usar cualquier enlace, por ejemplo `https://es.wikipedia.org`).

**Pregunta:** ¿qué pasaría si solo lo cambias en el frontend y no en el backend? (Pista:
capítulo 7, el formulario con reglas `@IsIn`.)

---

## Nivel 3 ⭐⭐⭐ — Agregar una regla nueva

### Ejercicio 7: máximo de créditos por estudiante
📖 *Capítulo 11 (reglas en los funcionarios), capítulo 9 (archivadores) y capítulo 4 (`reduce`)*

En las universidades no puedes inscribir todas las materias que quieras. Hagamos que el
máximo sea **12 créditos**.

**Archivo:** `backend/src/clases/clases.service.ts`, dentro de la función `inscribir`.

1. Busca la línea:

   ```ts
   // Regla universitaria: no puedes inscribir dos materias a la misma hora
   ```

2. Justo **antes** de esa línea, pega esto:

   ```ts
   // Regla: máximo 12 créditos por periodo
   const delPeriodo = await this.inscripciones.find({
     where: { estudiante: { id: estudianteId }, clase: { periodo: clase.periodo } },
     relations: { clase: true },
   });
   const creditos = delPeriodo.reduce((total, i) => total + i.clase.asignatura.creditos, 0);
   if (creditos + clase.asignatura.creditos > 12) {
     throw new ConflictException(`No puedes pasar de 12 créditos (ya tienes ${creditos})`);
   }
   ```

3. Guarda y espera `Found 0 errors`.
4. Entra como **Estudiante** (Sofía) → **Inscribir materias** e intenta inscribir cualquier
   materia. Como Sofía ya tiene 13 créditos, verás el mensaje en rojo.

5. Ahora ejecuta `npm test` en otra terminal. **Una prueba va a fallar:**

   ```
   × no deja inscribir una materia que se cruza de horario
   Expected: "Se cruza con Programación I"
   Received: "No puedes pasar de 12 créditos (ya tienes 13)"
   ```

   ¿Por qué? Esa prueba esperaba el error del **cruce de horario**, pero tu regla nueva se
   revisa **antes** y Sofía ya tiene 13 créditos. ¡La prueba te avisó que tu cambio afecta
   algo que ya funcionaba!

   **¿Cómo lo arreglarías?** Dos opciones: subir el límite (por ejemplo a 20, que es más
   realista), o mover tu regla **después** de la del cruce de horario. Prueba cualquiera y
   vuelve a ejecutar `npm test` hasta que todo pase.

Lee el código línea por línea:
1. **Busca** en el archivador las inscripciones de este estudiante en este periodo, trayendo
   también la clase de cada una (`relations`).
2. **Suma** los créditos de esas clases (`reduce`, capítulo 4).
3. **Si** con la nueva materia se pasa de 12, **rechaza** el pedido (`throw`, capítulo 7).

**Reto extra:** mueve el número `12` a `backend/src/comun/calculos.ts` como una constante
`CREDITOS_MAXIMOS`, para que esté junto a las demás reglas (capítulo 11).

---

## Nivel 4 ⭐⭐⭐⭐ — Retos para cuando te sientas listo

Estos no traen los pasos exactos. Usa la guía y el código existente como ejemplo.

### Reto A: el profesor ve el boletín de sus estudiantes
Hoy solo el estudiante (el suyo) y el rector ven boletines. Haz que un profesor pueda ver el
boletín de un estudiante **solo si** está en alguna de sus clases.
- Pistas: `backend/src/reportes/reportes.service.ts` (función `boletin`), el `@Roles` de
  `reportes.controller.ts`, y en el frontend `App.tsx` y `paginas/clase/PestanaEstudiantes.tsx`.

### Reto B: anuncios por clase
Que el profesor pueda publicar **anuncios** ("Mañana no hay clase") y los estudiantes los vean.
- Pista: copia la forma del departamento `material/` (entidad, formulario, funcionario,
  ventanilla, módulo), regístralo en `app.module.ts` (capítulo 8), y agrega una pestaña en
  `paginas/ClaseDetalle.tsx`.

---

🎉 Si llegaste hasta aquí, ya hiciste cambios en el diseño, en las pantallas, en las reglas y
en los datos. **Eso es trabajar en un proyecto completo.**

⬅️ Volver al [inicio](00-empieza-aqui.md) · 📖 [Diccionario](diccionario.md)
