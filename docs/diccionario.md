# 📖 Diccionario

Todas las palabras técnicas de la guía, explicadas en palabras simples. Están en orden
alfabético. El número entre paréntesis es el capítulo donde se explica con más detalle.

---

**API** (1) — La lista de pedidos que el backend sabe atender. Como la **carta** de un
restaurante: dice qué puedes pedir. En Nexo, todos empiezan por `/api`.

**Archivador** → ver *Repositorio*.

**async / await** (4) — Palabras para **esperar** tareas que toman tiempo (como buscar en la
base de datos) sin congelar el programa. Como pedir comida a domicilio: no te quedas parado en
la puerta.

**Backend** (1) — La parte que trabaja **detrás**: decide, calcula, revisa permisos y guarda
datos. La **cocina** del restaurante. Carpeta `backend/`.

**Base de datos** (6) — Donde se guarda la información de forma permanente, en tablas. La
**despensa** del restaurante. Usamos PostgreSQL.

**bcrypt** (10) — La herramienta que "licúa" las contraseñas para guardarlas de forma segura.

**Boolean** (3) — Un dato que solo puede ser `true` (sí) o `false` (no).

**Borrado en cadena / CASCADE** (9) — Si se borra algo, se borra también lo que depende de
ello. Si se elimina una clase, se eliminan sus inscripciones, notas y asistencia.

**Clase (en código)** (4) — Un **molde** para crear objetos con la misma forma. No confundir
con una clase de la universidad.

**Clase (en Nexo)** (6) — Un **grupo** de una asignatura: horario, salón, profesor y cupo.
Ejemplo: "Programación I, grupo A, lunes de 7 a 9".

**Commit** (2) — Una "foto" del proyecto guardada con Git, para poder volver atrás.

**Compilar** (2) — **Traducir** el código de TypeScript a JavaScript para poder ejecutarlo.

**Componente** (12) — Una **pieza de Lego** de la pantalla, que se puede reutilizar. Por
ejemplo, la etiqueta de color de una nota.

**Constante** (3, 11) — Una cajita cuyo valor no cambia (`const`). Las reglas de la
universidad se escriben como constantes en MAYÚSCULAS.

**Constructor** (4, 8) — Lo primero que se ejecuta al crear un objeto. En el backend sirve
para pedir lo que cada funcionario necesita.

**Contexto** (13) — Una **cartelera** que todas las pantallas pueden mirar. Lo usamos para
saber quién inició sesión desde cualquier parte.

**Controlador** (7) — La **ventanilla** del backend: recibe los pedidos y se los pasa al
funcionario (servicio). Archivos `*.controller.ts`.

**CORS** (13) — Una protección del navegador que bloquea pedidos entre "puertas" distintas.
Con el proxy de Vite no nos molesta.

**CSS** (14) — El idioma para decir **cómo se ve** cada cosa: colores, tamaños, espacios.

**CSV** (14) — Un formato de tabla escrito como texto, que Excel sabe abrir.

**Decorador** (7) — Las **etiquetas** que empiezan por `@` (`@Get`, `@Roles`, `@Entity`…).
Le dicen a NestJS o a TypeORM qué es cada parte del código.

**Dependencia** (2) — Una herramienta descargada de npm que el proyecto necesita.

**DTO** (7) — Un **formulario con reglas**. Describe qué datos acepta una ventanilla y revisa
que vengan bien llenos. Archivos en carpetas `dto/`.

**e2e / de punta a punta** (15) — Pruebas que encienden todo el backend con una base de datos
real y hacen pedidos como lo haría el frontend.

**Entidad** (9) — La **plantilla** de una ficha: describe las columnas de una tabla. Archivos
`*.entity.ts`.

**Estado** (12) — La **memoria** de una pantalla (una pizarra). Si cambia, React vuelve a
dibujar la pantalla. Se crea con `useState`.

**Excepción** (7) — Un **rechazo** con una razón. `throw new NotFoundException(...)` detiene
todo y responde con error 404.

**`.env`** (9) — La **caja fuerte** con los secretos (contraseñas). Nunca se sube a internet.

**fetch** (13) — La herramienta del navegador para enviar pedidos al backend.

**Frontend** (1) — La parte que **ves**: pantallas, botones y formularios. El **salón** del
restaurante. Carpeta `frontend/`.

**Función** (4) — Una **receta**: pasos con nombre que se pueden usar muchas veces.

**Función flecha** (4) — Una forma corta de escribir funciones: `(x) => x * 2`.

**Git** (2) — Una **máquina del tiempo** que guarda fotos (commits) del proyecto.

**`.gitignore`** (2) — La lista de cosas que Git **no** debe guardar (como `.env` y
`node_modules`).

**Guard / guardia** (10) — Un **portero** que revisa cada pedido antes de llegar a la
ventanilla. Hay dos: uno revisa la manilla (401) y otro el rol (403).

**Hash** (10) — El "jugo" que queda al licuar una contraseña. No se puede volver a la
contraseña original.

**Hook** (12) — Una herramienta especial de React. Su nombre siempre empieza por `use`
(`useState`, `useDatos`…).

**id** (6) — El **número de ficha**: identifica cada fila de una tabla. Se pone solo.

**import / export** (4) — Traer / compartir código entre archivos.

**Inscripción** (6) — La ficha que une a un estudiante con una clase. De ella cuelgan sus
notas y su asistencia.

**Interface / type** (4) — Describe la **forma** de un dato (qué campos tiene y de qué tipo).

**Inyección de dependencias** (8) — "**Pide lo que necesitas y te lo dan**". Cada pieza dice
en su constructor qué necesita, y NestJS se lo entrega listo.

**JavaScript** (2) — El idioma de programación de las páginas web.

**JSON** (1) — El formato en el que viajan los datos entre frontend y backend. Parece una
ficha: `{ "nombre": "Sofía" }`.

**JSX** (12) — HTML escrito dentro de TypeScript, para dibujar los componentes de React.

**JWT** → ver *Token*.

**Lista / array** (3) — Varios datos en orden, entre corchetes: `['Lunes', 'Martes']`.

**localhost** (1) — "Esta misma computadora".

**localStorage** (13) — El **bolsillo** del navegador: guarda datos (como la manilla) aunque
recargues la página.

**Manilla** → ver *Token*.

**Migración** (9) — Una forma segura de cambiar las tablas en un sistema real. Nosotros usamos
`synchronize` porque es más cómodo para aprender.

**Módulo** (8) — Un **departamento** del backend: agrupa sus ventanillas y funcionarios.
Archivos `*.module.ts`.

**NestJS** (2) — El **molde** que usamos para ordenar el código del backend.

**Node.js** (2) — El **motor** que ejecuta JavaScript fuera del navegador (el backend).

**node_modules** (2) — La **bodega** donde npm guarda las herramientas descargadas. No se
toca.

**npm** (2) — La **tienda** de herramientas de JavaScript. También ejecuta los atajos
(`npm run dev`).

**null** (3) — "Vacío a propósito": no hay nada. Por ejemplo, un estudiante sin teléfono.

**Objeto** (3) — Una **ficha** que agrupa varios datos: `{ nombre: 'Sofía', semestre: 1 }`.

**package.json** (2) — La **lista de compras** (herramientas) y de **atajos** (scripts) de cada
parte del proyecto.

**Parámetro** (4) — Un **ingrediente** que recibe una función.

**Periodo** (11) — El semestre académico: `2026-1` (enero a junio) o `2026-2` (julio a
diciembre).

**pgAdmin** (6) — El programa para ver las tablas de PostgreSQL como si fueran Excel.

**Pipe** (7) — Un paso por el que pasa un dato antes de llegar a la ventanilla, para
transformarlo o revisarlo. `ParseIntPipe` convierte `'5'` en el número `5`.

**PostgreSQL** (6) — El programa de base de datos que usamos.

**Prettier** (2) — El corrector que ordena la **presentación** del código.

**Promedio ponderado** (11) — Un promedio donde las materias con más créditos pesan más.

**Props** (12) — Las **instrucciones** que se le pasan a un componente: `<EtiquetaNota valor={4.2} />`.

**Proxy** (13) — Un **recepcionista** que reenvía pedidos. Vite reenvía los pedidos `/api` del
frontend (puerta 5173) al backend (puerta 3000).

**Puerto** (1) — El número de la **puerta** por donde atiende un programa: 5173 el frontend,
3000 el backend, 5432 PostgreSQL.

**React** (12) — La herramienta que usamos para armar las pantallas con componentes.

**Relación** (6, 9) — Cuando una tabla **apunta** a otra usando su id (como "ver página 45").
Se escribe con `@ManyToOne` y `@OneToMany`.

**Repositorio** (9) — El **archivador** de una tabla: sirve para buscar, guardar y borrar
fichas.

**Rol** (10) — El tipo de usuario: estudiante, profesor o rector. Decide qué puede hacer.

**Ruta** (1, 12) — Una **dirección**: `/api/clases` en el backend o `/mis-notas` en el
frontend.

**Script** (2) — Un **atajo** escrito en `package.json`. Se ejecuta con `npm run nombre`.

**Semilla** (6, 9) — Los **datos de ejemplo** que se crean solos la primera vez.

**Servicio** (7) — El **funcionario** del backend: hace el trabajo de verdad (reglas, cálculos,
guardar). Archivos `*.service.ts`.

**SPA** (12) — Página de una sola hoja: React cambia el contenido sin recargar el navegador.

**SQL** (9) — El idioma de las bases de datos. TypeORM lo escribe por nosotros.

**String** (3) — Un texto, siempre entre comillas: `'Hola'`.

**synchronize** (9) — La opción que hace que TypeORM cree y ajuste las tablas solo, a partir de
las entidades.

**Tabla** (6) — Una "hoja de Excel" dentro de la base de datos: filas y columnas.

**Terminal** (2) — La ventana donde le das órdenes a la computadora escribiendo.

**Token / JWT** (10) — La **manilla sellada** que recibes al iniciar sesión. Dice quién eres y
vence en 8 horas. El navegador la muestra en cada pedido.

**Transacción** (9) — Un grupo de cambios que se hace **todo o nada**, como una transferencia
bancaria.

**try / catch** (4) — "**Intenta** esto, y si falla, **atrapa** el error" en vez de romper todo.

**TypeORM** (9) — El **traductor** entre TypeScript y la base de datos (SQL).

**TypeScript** (2) — JavaScript con un **corrector** que te avisa de errores mientras escribes.

**useEffect** (13) — Un hook que significa "**después de dibujar**, haz esto". Lo usamos para
pedir datos al backend.

**useState** (12) — El hook que crea una pizarra (estado) en un componente.

**Variable** (3) — Una **cajita con nombre** donde se guarda un dato.

**Vite** (2, 13) — El programa que sirve el frontend mientras programas: lo traduce, lo
muestra y lo actualiza al instante. También hace de proxy.

**Vitest** (15) — La herramienta con la que escribimos las pruebas automáticas.

⬅️ Volver al [inicio](00-empieza-aqui.md)
