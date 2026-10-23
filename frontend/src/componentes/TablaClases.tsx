import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { ClaseResumen } from '../api/tipos'

// Tabla de clases reutilizable (panel, lista de clases, inscripción...).
// "acciones" permite agregar botones al final de cada fila.
export function TablaClases<T extends ClaseResumen>({
  clases,
  enlazar = true,
  acciones,
  vacio = 'No hay clases.',
}: {
  clases: T[]
  enlazar?: boolean
  acciones?: (clase: T) => ReactNode
  vacio?: string
}) {
  return (
    <div className="tabla-contenedor">
      <table className="tabla">
        <thead>
          <tr>
            <th>Asignatura</th>
            <th>Horario</th>
            <th>Salón</th>
            <th>Profesor</th>
            <th>Inscritos</th>
            {acciones && <th />}
          </tr>
        </thead>
        <tbody>
          {clases.map((clase) => (
            <tr key={clase.id}>
              <td>
                <span className="texto-suave codigo">{clase.asignatura.codigo}</span>{' '}
                {enlazar ? (
                  <Link to={`/clases/${clase.id}`}>
                    <strong>{clase.asignatura.nombre}</strong>
                  </Link>
                ) : (
                  <strong>{clase.asignatura.nombre}</strong>
                )}
                <div className="texto-suave texto-pequeno">
                  Grupo {clase.grupo} · {clase.asignatura.creditos} créditos
                </div>
              </td>
              <td className="numeros">
                {clase.dia}
                <div className="texto-suave texto-pequeno">
                  {clase.horaInicio} - {clase.horaFin}
                </div>
              </td>
              <td>{clase.salon}</td>
              <td>{clase.profesor.nombre}</td>
              <td className="numeros">
                {clase.inscritos}/{clase.cupo}
              </td>
              {acciones && <td className="celda-acciones">{acciones(clase)}</td>}
            </tr>
          ))}
          {clases.length === 0 && (
            <tr>
              <td colSpan={6} className="texto-suave">
                {vacio}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
