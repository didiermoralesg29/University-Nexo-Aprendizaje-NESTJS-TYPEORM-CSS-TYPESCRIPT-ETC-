# 1. ¿Qué es una página web por dentro?

## Piensa en un restaurante 🍽️

Cuando vas a un restaurante pasan tres cosas:

1. Te sientas en el **salón**, miras la carta y le pides algo al mesero.
2. El mesero lleva tu pedido a la **cocina**. Allí deciden si se puede hacer y lo preparan.
3. La cocina saca los ingredientes de la **despensa**, donde se guarda todo.

Tú nunca entras a la cocina ni a la despensa. Solo ves el salón y lo que te traen.

Nexo University funciona exactamente igual. Tiene **tres partes**:

| En el restaurante | En Nexo University | Nombre técnico |
|---|---|---|
| 🪑 El salón (lo que ves) | Las pantallas, los botones y los formularios | **Frontend** |
| 👨‍🍳 La cocina (donde se trabaja) | El programa que decide, calcula y revisa permisos | **Backend** |
| 🗄️ La despensa (donde se guarda) | El lugar donde quedan guardados todos los datos | **Base de datos** |

> 💡 "Front" significa **frente** (lo que está adelante, lo que ves) y "back" significa
> **detrás** (lo que trabaja escondido).

## Un ejemplo completo: Sofía quiere ver sus notas

```
   SOFÍA                  FRONTEND              BACKEND               BASE DE DATOS
 (navegador)             (el salón)           (la cocina)             (la despensa)

 1. clic en      ───►  2. "el backend,     ───► 3. "¿quién eres?    ───► 4. busca las notas
 "Mis notas"              dame las notas          ¿puedes verlas?"           de Sofía
                          de Sofía"

 8. ve sus       ◄───  7. dibuja la tabla  ◄─── 6. calcula los      ◄─── 5. entrega las
 notas en               con colores              promedios y             notas
 pantalla                                        responde
```

Fíjate en el paso 3: la cocina **revisa** quién pide. Si un estudiante intenta ver las notas
de otro, la cocina dice que no. Por eso es tan importante que haya una cocina en el medio.

## ¿Por qué separarlo en tres partes?

1. **Seguridad.** Nadie toca la despensa directamente. Todo pasa por la cocina, que revisa
   permisos. Un estudiante no puede cambiar sus notas porque el backend no lo deja.
2. **Orden.** Cada parte tiene un solo trabajo:
   - ¿Quieres cambiar el color de un botón? Solo tocas el **frontend**.
   - ¿Quieres cambiar cómo se calcula una nota? Solo tocas el **backend**.
3. **Memoria.** Si apagas todo, los datos siguen en la **base de datos**. Como la despensa:
   aunque cierren el restaurante en la noche, los ingredientes siguen ahí al otro día.

## ¿Cómo se hablan el frontend y el backend?

Con **mensajes**, como el mesero y la cocina. El frontend manda un **pedido** y el backend
contesta con una **respuesta**.

### El pedido tiene dos partes

**1. Qué quieres hacer.** Se dice con una palabra en inglés (llamada *verbo*):

| Verbo | Significa | Ejemplo en Nexo |
|---|---|---|
| `GET` | Ver algo | Ver mis clases |
| `POST` | Crear algo nuevo | Registrar un estudiante |
| `PATCH` | Cambiar una parte de algo | Cambiar el semestre de un estudiante |
| `PUT` | Guardar algo completo | Guardar todas las notas de una clase |
| `DELETE` | Borrar algo | Borrar un material |

**2. Sobre qué.** Se dice con una dirección llamada **ruta**, como `/api/clases`.

Juntos se leen como una frase:

| Pedido | Se lee |
|---|---|
| `GET /api/clases` | "**Muéstrame** las **clases**" |
| `POST /api/usuarios` | "**Crea** un **usuario**" |
| `DELETE /api/material/9` | "**Borra** el **material número 9**" |

A veces el pedido también lleva **datos**, por ejemplo cuando registras a un estudiante
(su nombre, correo, etc.).

### La respuesta también tiene dos partes

**1. Un número** que dice cómo salió todo:

| Número | Significa | Ejemplo |
|---|---|---|
| **200** | ✅ Todo bien | Viste tus clases |
| **201** | ✅ Se creó lo que pediste | Se registró el estudiante |
| **204** | ✅ Hecho (no hay nada que mostrar) | Se borró el material |
| **400** | ❌ Enviaste algo mal | Una nota de 7.0 (el máximo es 5.0) |
| **401** | ❌ No has iniciado sesión | Entrar sin usuario |
| **403** | ❌ No tienes permiso | Un estudiante intentando poner notas |
| **404** | ❌ Eso no existe | La clase número 999 |
| **409** | ❌ Choca con algo | Dos materias a la misma hora |

> 💡 Truco para recordarlos: los que empiezan por **2** son buenos ✅, los que empiezan por
> **4** son errores de quien pidió ❌, y los que empiezan por **5** son errores del servidor 💥.

**2. Los datos**, escritos en un formato llamado **JSON** (se pronuncia "yeison").
Parece una ficha:

```json
{
  "nombre": "Sofía Martínez",
  "programa": "Ingeniería de Sistemas",
  "semestre": 1
}
```

Se lee: el **nombre** es "Sofía Martínez", el **programa** es "Ingeniería de Sistemas" y el
**semestre** es 1. A la izquierda va el nombre del dato y a la derecha su valor.

## La "carta" del restaurante: la API

La carta de un restaurante dice **qué puedes pedir**. En un sistema, a la lista de todos los
pedidos que el backend sabe atender se le llama **API**.

La API de Nexo University tiene pedidos como "ver mis clases", "registrar un estudiante",
"guardar notas", "generar reporte"… Todos empiezan por `/api`.

## ¿Dónde vive cada parte?

En tu computadora hay **tres programas** encendidos cuando usas Nexo University. Cada uno
atiende en una **puerta** distinta (técnicamente, un **puerto**, que es solo un número):

| Parte | Puerta (puerto) | Dirección |
|---|---|---|
| Frontend | 5173 | http://localhost:5173 ← la que abres en el navegador |
| Backend | 3000 | http://localhost:3000/api |
| Base de datos (PostgreSQL) | 5432 | (no se abre en el navegador) |

> 💡 **localhost** significa "**esta misma computadora**". Por ahora todo vive en tu PC.
> Cuando un proyecto se publica en internet, estas tres partes viven en computadoras de
> alguna empresa (servidores), pero funcionan igual.

## Resumen

- Una página web tiene **frontend** (lo que ves), **backend** (lo que trabaja) y
  **base de datos** (lo que guarda).
- El frontend y el backend se hablan con **pedidos** (verbo + ruta) y **respuestas**
  (número + datos en JSON).
- La lista de pedidos posibles se llama **API**.

➡️ Siguiente: [La terminal y las herramientas](02-la-terminal-y-las-herramientas.md)
