import { Link, useParams } from 'react-router'
import type { ReporteClase as DatosReporte } from '../api/tipos'
import { useDatos } from '../hooks/useDatos'
import { Aviso } from '../componentes/Aviso'
import { Cargando } from '../componentes/Cargando'
import { EtiquetaAsistencia, EtiquetaEstado, EtiquetaNota } from '../componentes/Etiquetas'
import { descargarCsv } from '../utilidades/csv'
import { formatoFechaHora, formatoNota, formatoPorcentaje, horario } from '../utilidades/formato'

// Reporte de notas de una clase, listo para imprimir o descargar
export function ReporteClase() {
  const { id } = useParams()
  const { datos, cargando, error } = useDatos<DatosReporte>(`/reportes/clases/${id}`)

  if (cargando) return <Cargando />
  if (error) return <Aviso>{error}</Aviso>
  if (!datos) return null

  const { clase, evaluaciones, filas, resumen } = datos

  function exportar() {
    descargarCsv(`reporte-${clase.asignatura.codigo}-${clase.grupo}.csv`, [
      ['Nexo University - Reporte de notas'],
      ['Asignatura', `${clase.asignatura.codigo} ${clase.asignatura.nombre}`, 'Grupo', clase.grupo],
      ['Profesor', clase.profesor.nombre, 'Periodo', clase.periodo],
      [],
      [
        'Código',
        'Estudiante',
        ...evaluaciones.map((e) => `${e.nombre} (${e.porcentaje}%)`),
        'Definitiva',
        'Promedio actual',
        'Asistencia %',
        'Estado',
      ],
      ...filas.map((f) => [
        f.estudiante.codigo,
        f.estudiante.nombre,
        ...f.valores,
        f.definitiva,
        f.promedioActual,
        f.asistencia,
        f.estado,
      ]),
    ])
  }

  return (
    <article className="documento">
      <Link to="/reportes" className="volver no-imprimir">
        ← Volver a reportes
      </Link>

      <header className="documento-encabezado">
        <div>
          <p className="texto-suave">Nexo University · Reporte de notas · Periodo {clase.periodo}</p>
          <h1>
            {clase.asignatura.nombre} <span className="texto-suave">· Grupo {clase.grupo}</span>
          </h1>
          <p className="texto-suave">
            {clase.asignatura.codigo} · {clase.profesor.nombre} · {horario(clase)} · {clase.salon}
          </p>
        </div>
        <div className="acciones no-imprimir">
          <button type="button" className="boton" onClick={() => window.print()}>
            Imprimir / PDF
          </button>
          <button type="button" className="boton boton-secundario" onClick={exportar}>
            Descargar Excel (CSV)
          </button>
        </div>
      </header>

      <section className="estadisticas">
        <div className="tarjeta estadistica">
          <span className="estadistica-valor">{resumen.estudiantes}</span>
          <span className="estadistica-etiqueta">Estudiantes</span>
        </div>
        <div className="tarjeta estadistica">
          <span className="estadistica-valor">{formatoNota(resumen.promedio)}</span>
          <span className="estadistica-etiqueta">Promedio del grupo</span>
        </div>
        <div className="tarjeta estadistica">
          <span className="estadistica-valor">{resumen.enRiesgo}</span>
          <span className="estadistica-etiqueta">En riesgo</span>
        </div>
        <div className="tarjeta estadistica">
          <span className="estadistica-valor">{formatoPorcentaje(resumen.asistenciaPromedio)}</span>
          <span className="estadistica-etiqueta">Asistencia promedio</span>
        </div>
      </section>

      <div className="tabla-contenedor separado">
        <table className="tabla">
          <thead>
            <tr>
              <th>Código</th>
              <th>Estudiante</th>
              {evaluaciones.map((e) => (
                <th key={e.id} className="centrado">
                  {e.nombre}
                  <div className="texto-pequeno">{e.porcentaje}%</div>
                </th>
              ))}
              <th className="centrado">Definitiva</th>
              <th className="centrado">Promedio actual</th>
              <th className="centrado">Asistencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.inscripcionId}>
                <td className="numeros">{f.estudiante.codigo}</td>
                <td>{f.estudiante.nombre}</td>
                {f.valores.map((v, i) => (
                  <td key={evaluaciones[i].id} className="centrado numeros">
                    {formatoNota(v)}
                  </td>
                ))}
                <td className="centrado numeros">
                  <strong>{formatoNota(f.definitiva)}</strong>
                </td>
                <td className="centrado">
                  <EtiquetaNota valor={f.promedioActual} />
                </td>
                <td className="centrado">
                  <EtiquetaAsistencia valor={f.asistencia} />
                </td>
                <td>
                  <EtiquetaEstado estado={f.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="texto-suave texto-pequeno separado">
        Porcentaje evaluado: {datos.porcentajeTotal}% · Generado el {formatoFechaHora(datos.generadoEn)}
      </p>
    </article>
  )
}
