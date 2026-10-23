import { Link } from 'react-router'
import type { ResumenClaseReporte } from '../api/tipos'
import { useAuth } from '../auth/useAuth'
import { useDatos } from '../hooks/useDatos'
import { Aviso } from '../componentes/Aviso'
import { Cargando } from '../componentes/Cargando'
import { EtiquetaAsistencia, EtiquetaNota } from '../componentes/Etiquetas'
import { descargarCsv } from '../utilidades/csv'

// Resumen de rendimiento de cada clase (profesor: las suyas | rector: todas)
export function Reportes() {
  const { tieneRol } = useAuth()
  const { datos, cargando, error } = useDatos<ResumenClaseReporte[]>('/reportes/clases')

  function exportar() {
    if (!datos) return
    descargarCsv('resumen-clases.csv', [
      [
        'Código',
        'Asignatura',
        'Grupo',
        'Profesor',
        'Estudiantes',
        'Promedio',
        'En riesgo',
        'Asistencia %',
        '% evaluado',
      ],
      ...datos.map((r) => [
        r.clase.asignatura.codigo,
        r.clase.asignatura.nombre,
        r.clase.grupo,
        r.clase.profesor.nombre,
        r.estudiantes,
        r.promedio,
        r.enRiesgo,
        r.asistenciaPromedio,
        r.porcentajeEvaluado,
      ]),
    ])
  }

  return (
    <>
      <div className="encabezado">
        <div>
          <h1>Reportes de notas</h1>
          <p className="subtitulo">
            "En riesgo" = estudiantes que, con lo evaluado hasta ahora, van perdiendo la materia.
          </p>
        </div>
        {datos && datos.length > 0 && (
          <button type="button" className="boton boton-secundario" onClick={exportar}>
            Descargar Excel (CSV)
          </button>
        )}
      </div>

      <Aviso>{error}</Aviso>
      {cargando && <Cargando />}

      {datos && (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Clase</th>
                {tieneRol('rector') && <th>Profesor</th>}
                <th className="centrado">Estudiantes</th>
                <th className="centrado">Promedio</th>
                <th className="centrado">En riesgo</th>
                <th className="centrado">Asistencia</th>
                <th className="centrado">Evaluado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {datos.map((r) => (
                <tr key={r.clase.id}>
                  <td>
                    <span className="texto-suave codigo">{r.clase.asignatura.codigo}</span>{' '}
                    <strong>{r.clase.asignatura.nombre}</strong>
                    <div className="texto-suave texto-pequeno">Grupo {r.clase.grupo}</div>
                  </td>
                  {tieneRol('rector') && <td>{r.clase.profesor.nombre}</td>}
                  <td className="centrado numeros">{r.estudiantes}</td>
                  <td className="centrado">
                    <EtiquetaNota valor={r.promedio} />
                  </td>
                  <td className={`centrado numeros ${r.enRiesgo > 0 ? 'texto-alerta' : ''}`}>{r.enRiesgo}</td>
                  <td className="centrado">
                    <EtiquetaAsistencia valor={r.asistenciaPromedio} />
                  </td>
                  <td className="centrado numeros">{r.porcentajeEvaluado}%</td>
                  <td className="celda-acciones">
                    <Link to={`/reportes/clases/${r.clase.id}`}>Ver reporte</Link>
                  </td>
                </tr>
              ))}
              {datos.length === 0 && (
                <tr>
                  <td colSpan={8} className="texto-suave">
                    No hay clases.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tieneRol('rector') && (
        <p className="texto-suave separado">
          El boletín de cada estudiante está en <Link to="/estudiantes">Estudiantes</Link> → Boletín.
        </p>
      )}
    </>
  )
}
