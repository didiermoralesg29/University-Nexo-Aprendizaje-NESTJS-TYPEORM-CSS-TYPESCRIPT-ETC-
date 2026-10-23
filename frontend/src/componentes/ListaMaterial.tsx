import type { MaterialItem } from '../api/tipos'
import { formatoFecha } from '../utilidades/formato'

export function ListaMaterial({
  materiales,
  alEliminar,
}: {
  materiales: MaterialItem[]
  alEliminar?: (material: MaterialItem) => void
}) {
  if (materiales.length === 0) {
    return <p className="tarjeta texto-suave">Todavía no hay material.</p>
  }
  return (
    <div className="rejilla">
      {materiales.map((m) => (
        <article key={m.id} className="tarjeta material">
          <span className="etiqueta etiqueta-neutra">{m.tipo}</span>
          <h3>{m.titulo}</h3>
          {m.descripcion && <p>{m.descripcion}</p>}
          <p className="texto-suave texto-pequeno">
            {m.clase.asignatura} (grupo {m.clase.grupo}) · {m.clase.profesor}
            <br />
            Publicado el {formatoFecha(m.creadoEn)}
          </p>
          <div className="acciones">
            {/* target="_blank" abre en otra pestaña; rel="noreferrer" por seguridad */}
            <a href={m.enlace} target="_blank" rel="noreferrer" className="boton boton-secundario">
              Abrir
            </a>
            {alEliminar && m.puedeEliminar && (
              <button type="button" className="boton boton-peligro" onClick={() => alEliminar(m)}>
                Eliminar
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
