# Frontend de Nexo University

Interfaz hecha con **React + TypeScript + Vite**.

```bash
npm run dev      # http://localhost:5173 (necesita el backend encendido)
npm run build    # revisa tipos y empaqueta en dist/
npm run lint     # revisa el código
npm run format   # ordena el formato
```

Las peticiones a `/api` se reenvían al backend (`localhost:3000`) gracias al proxy de
`vite.config.ts`.

Dónde está cada cosa:

| Carpeta | Contenido |
|---|---|
| `src/paginas/` | Una pantalla por archivo |
| `src/componentes/` | Piezas reutilizables: menú, tablas, etiquetas, formularios |
| `src/api/` | `cliente.ts` (fetch + token) y `tipos.ts` (forma de los datos) |
| `src/auth/` | Sesión del usuario y rutas protegidas |
| `src/hooks/` | `useDatos`, para cargar datos de la API |
| `src/estilos.css` | Todo el diseño (colores en variables al inicio) |

Explicación completa en los capítulos [12](../docs/12-frontend-piezas.md), [13](../docs/13-frontend-habla-con-backend.md) y [14](../docs/14-frontend-diseno.md) de la guía.
