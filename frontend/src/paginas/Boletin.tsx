import { Link, useParams } from 'react-router'
import type { Boletin as DatosBoletin } from '../api/tipos'
import { useAuth } from '../auth/useAuth'
import { useDatos } from '../hooks/useDatos'
import { Aviso } from '../componentes/Aviso'
import { Cargando } from '../componentes/Cargando'
import { EtiquetaAsistencia, EtiquetaEstado, EtiquetaNota } from '../componentes/Etiquetas'
import { descargarCsv } from '../utilidades/csv'
import { formatoFechaHora, formatoNota, horario } from '../utilidades/formato'

// Boletín de notas. Sirve para:
//  /mis-notas                 -> el estudiante ve el suyo
//  /estudiantes/:id/boletin   -> el rector ve el de cualquier estudiante
export function Boletin() {
  const { usuario } = useAuth()
  const { id } = useParams()
  const estudianteId = id ?? String(usuario?.id)
  const { datos, cargando, error } = useDatos<DatosBoletin>(`/reportes/estudiantes/${estudianteId}`)

  if (cargando) return <Cargando />
  if (error) return <Aviso>{error}</Aviso>
  if (!datos) return null

  const { estudiante } = datos

  function exportar() {
    if (!datos) return
    const filas: (string | number | null)[][] = [
      ['Nexo University - Boletín de notas'],
      ['Estudiante', estudiante.nombre, 'Código', estudiante.codigo],
      ['Programa', estudiante.programa, 'Periodo', datos.periodo],
      [],
      [
        'Código',
        'Asignatura',
        'Créditos',
        'Profesor',
        'Definitiva',
        'Promedio actual',
        '% evaluado',
        'Asistencia %',
        'Estado',
      ],
      ...datos.materias.map((m) => [
        m.clase.asignatura.codigo,
        m.clase.asignatura.nombre,
        m.clase.asignatura.creditos,
        m.clase.profesor.nombre,
        m.definitiva,
        m.promedioActual,
        m.porcentajeEvaluado,
        m.asistencia,
        m.estado,
      ]),
      [],
      ['Promedio ponderado', datos.promedioPonderado],
    ]
    descargarCsv(`boletin-${estudiante.codigo}.csv`, filas)
  }

  return (
    <article className="documento">
      {id && (
        <Link to="/estudiantes" className="volver no-imprimir">
          ← Volver a estudiantes
        </Link>
      )}

      <header className="documento-encabezado">
        <div>
          <p className="texto-suave">Nexo University · Boletín de notas · Periodo {datos.periodo}</p>
          <h1>{estudiante.nombre}</h1>
          <p className="texto-suave">
            Código {estudiante.codigo} · {estudiante.programa} · Semestre {estudiante.semestre}
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
          <span className="estadistica-valor">{formatoNota(datos.promedioPonderado)}</span>
          <span className="estadistica-etiqueta">Promedio ponderado actual</span>
        </div>
        <div className="tarjeta estadistica">
          <span className="estadistica-valor">{datos.materias.length}</span>
          <span className="estadistica-etiqueta">Materias</span>
        </div>
        <div className="tarjeta estadistica">
          <span className="estadistica-valor">{datos.creditos}</span>
          <span className="estadistica-etiqueta">Créditos</span>
        </div>
      </section>

      {datos.materias.length === 0 && (
        <p className="tarjeta texto-suave separado">
          No hay materias inscritas. {!id && <Link to="/inscripcion">Inscribe tus materias</Link>}
        </p>
      )}

      {datos.materias.map((m) => (
        <section key={m.clase.id} className="tarjeta materia separado">
          <div className="encabezado">
            <div>
              <p className="texto-suave codigo">
                {m.clase.asignatura.codigo} · {m.clase.asignatura.creditos} créditos · {horario(m.clase)}
              </p>
              <h2>{m.clase.asignatura.nombre}</h2>
              <p className="texto-suave">{m.clase.profesor.nombre}</p>
            </div>
            <EtiquetaEstado estado={m.estado} />
          </div>

          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Evaluación</th>
                  <th className="centrado">Porcentaje</th>
                  <th className="centrado">Nota</th>
                </tr>
              </thead>
              <tbody>
                {m.evaluaciones.map((e) => (
                  <tr key={e.nombre}>
                    <td>{e.nombre}</td>
                    <td className="centrado numeros">{e.porcentaje}%</td>
                    <td className="centrado">
                      <EtiquetaNota valor={e.valor} />
                    </td>
                  </tr>
                ))}
                {m.evaluaciones.length === 0 && (
                  <tr>
                    <td colSpan={3} className="texto-suave">
                      El profesor aún no ha creado evaluaciones.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="datos-fila">
            <span>
              Definitiva acumulada: <strong>{formatoNota(m.definitiva)}</strong>
            </span>
            <span>
              Promedio actual: <EtiquetaNota valor={m.promedioActual} />
            </span>
            <span>
              Evaluado: <strong>{m.porcentajeEvaluado}%</strong>
            </span>
            <span>
              Asistencia: <EtiquetaAsistencia valor={m.asistencia} />
            </span>
          </div>
        </section>
      ))}

      <p className="texto-suave texto-pequeno separado">Generado el {formatoFechaHora(datos.generadoEn)}</p>
    </article>
  )
}
