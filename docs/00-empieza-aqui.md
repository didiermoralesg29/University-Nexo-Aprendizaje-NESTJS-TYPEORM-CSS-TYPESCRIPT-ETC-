# 0. Empieza aquí

¡Hola! Esta guía es para ti, aunque **nunca hayas programado una página web**.

Aquí se explica **todo** lo que tiene Nexo University: cómo se creó, cómo funciona por
dentro, por qué está hecho así y cómo puedes cambiarlo tú.

## Cómo está ordenada

La guía va **de lo más fácil a lo más difícil**, como una escalera. Cada capítulo usa
solamente lo que ya aprendiste en los anteriores. Por eso es importante leerla **en orden**.

```
         Parte 4: Practicar           ← 15. Ejercicios
        Parte 3: El frontend          ← 12, 13, 14
       Parte 2: El backend            ← 7, 8, 9, 10, 11
      Parte 1: Las bases              ← 1, 2, 3, 4, 5, 6
```

| # | Capítulo | Vas a entender… |
|---|---|---|
| | **Parte 1 · Las bases** | |
| 1 | [¿Qué es una página web por dentro?](01-que-es-una-pagina-web.md) | Las 3 partes de Nexo University, explicadas con un restaurante |
| 2 | [La terminal y las herramientas](02-la-terminal-y-las-herramientas.md) | Qué instalamos, para qué sirve cada cosa y cómo se creó el proyecto |
| 3 | [Aprender a leer código (parte 1)](03-leer-codigo-parte-1.md) | Variables, tipos, listas, fichas (objetos) y decisiones (if) |
| 4 | [Aprender a leer código (parte 2)](04-leer-codigo-parte-2.md) | Funciones, clases, esperar (async/await) y archivos que se comparten |
| 5 | [Las carpetas del proyecto](05-las-carpetas.md) | Qué hay en cada carpeta y cuáles puedes tocar |
| 6 | [La base de datos](06-la-base-de-datos.md) | Dónde y cómo se guarda la información |
| | **Parte 2 · El backend (la cocina)** | |
| 7 | [Cómo el backend atiende un pedido](07-backend-atender-un-pedido.md) | Ventanilla, formulario, funcionario: la idea central del backend |
| 8 | [Los departamentos del backend](08-backend-departamentos.md) | Cómo se organizan y se ayudan las distintas áreas |
| 9 | [El backend y la base de datos](09-backend-y-base-de-datos.md) | Cómo el código crea las tablas, guarda y busca datos |
| 10 | [Iniciar sesión y permisos](10-iniciar-sesion-y-permisos.md) | Contraseñas seguras, la "manilla" de sesión y los guardias |
| 11 | [Las reglas de la universidad](11-las-reglas-de-la-universidad.md) | Cómo se calculan notas, asistencia y promedios |
| | **Parte 3 · El frontend (el salón)** | |
| 12 | [Las piezas de la pantalla](12-frontend-piezas.md) | Componentes, memoria de la pantalla y páginas |
| 13 | [El frontend habla con el backend](13-frontend-habla-con-backend.md) | Cómo se piden y envían datos, formularios y sesión |
| 14 | [El diseño: colores y tamaños](14-frontend-diseno.md) | CSS, celular, imprimir y descargar Excel |
| | **Parte 4 · Comprobar y practicar** | |
| 15 | [Pruebas, comandos y errores comunes](15-pruebas-y-problemas.md) | Cómo sabemos que todo funciona y qué hacer si algo falla |
| 16 | [Ejercicios](16-ejercicios.md) | Practica haciendo cambios, de fácil a difícil |
| 📖 | [Diccionario](diccionario.md) | Todas las palabras técnicas, en palabras simples |

## Consejos para leer

- No necesitas entender todo a la primera. **Es normal.** Sigue leyendo y vuelve después.
- Ten el proyecto abierto en VS Code: cuando la guía mencione un archivo, ábrelo y míralo.
- Cuando veas una palabra rara, búscala en el **[Diccionario](diccionario.md)**.
- Los cuadros con 💡 son ideas importantes. Los que tienen ⚠️ son advertencias.

## Encender el proyecto

Esto es lo único que necesitas hoy para ver la página funcionando:

1. Abre la carpeta `Proyect` en VS Code.
2. Abre una terminal: menú **Terminal → New Terminal** (en el capítulo 2 verás qué es).
3. Escribe esto y presiona **Enter**:

   ```bash
   npm run dev
   ```

4. Espera hasta que aparezca: `API de Nexo University en http://localhost:3000/api`
5. Abre el navegador en **http://localhost:5173**
6. Pulsa **Rector**, **Profesor** o **Estudiante** y luego **Iniciar sesión**.

Para apagarlo: haz clic en la terminal y presiona `Ctrl + C`.

> 💡 La terminal debe quedar **abierta** mientras usas la página. Si la cierras, la página
> deja de funcionar.

➡️ Siguiente: [¿Qué es una página web por dentro?](01-que-es-una-pagina-web.md)
