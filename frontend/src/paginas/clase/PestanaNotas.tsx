import { useState, type FormEvent } from 'react'
import { api, textoDeError } from '../../api/cliente'
import type { EvaluacionResumen, Planilla } from '../../api/tipos'
import { useDatos } from '../../hooks/useDatos'
import { Aviso } from '../../componentes/Aviso'
import { Cargando } from '../../componentes/Cargando'
import { EtiquetaAsistencia, EtiquetaEstado, EtiquetaNota } from '../../componentes/Etiquetas'
import { formatoNota } from '../../utilidades/formato'

// Clave de cada celda de la planilla: "inscripción-evaluación"
const clave = (inscripcionId: number, evaluacionId: number) => `${inscripcionId}-${evaluacionId}`

// Convierte la planilla del servidor en { '3-7': '4.5', ... } para los <input>
function celdasDesde(planilla: Planilla) {
  const celdas: Record<string, string> = {}
  for (const fila of planilla.filas) {
    planilla.evaluaciones.forEach((evaluacion, i) => {
      const valor = fila.valores[i]
      celdas[clave(fila.inscripcionId, evaluacion.id)] = valor === null ? '' : String(valor)
    })
  }
  return celdas
}

export function PestanaNotas({ claseId }: { claseId: number }) {
  const { datos: planilla, setDatos, cargando, error } = useDatos<Planilla>(`/clases/${claseId}/notas`)
  // Solo guardamos las celdas que el profesor EDITÓ (el resto viene del servidor)
  const [editadas, setEditadas] = useState<Record<string, string>>({})
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  // Formulario de nueva evaluación
  const [nombre, setNombre] = useState('')
  const [porcentaje, setPorcentaje] = useState('')

  if (cargando && !planilla) return <Cargando />
  if (error) return <Aviso>{error}</Aviso>
  if (!planilla) return null

  const original = celdasDesde(planilla)
  const celdas = { ...original, ...editadas } // lo que se ve en cada <input>
  const disponible = 100 - planilla.porcentajeTotal
  const cambios = Object.keys(editadas).filter((k) => editadas[k] !== original[k])

  // Recibe la planilla actualizada que devuelve el servidor
  function actualizar(nueva: Planilla, mensaje: string) {
    setDatos(nueva)
    setEditadas({})
    setExito(mensaje)
    setErrorAccion(null)
  }

  async function guardarNotas() {
    setErrorAccion(null)
    setExito(null)
    // Validamos en el navegador antes de enviar (el servidor valida otra vez)
    const notas = []
    for (const k of cambios) {
      const [inscripcionId, evaluacionId] = k.split('-').map(Number)
      const texto = celdas[k].trim().replace(',', '.')
      const valor = texto === '' ? null : Number(texto)
      if (valor !== null && (isNaN(valor) || valor < 0 || valor > 5)) {
        setErrorAccion(`"${celdas[k]}" no es una nota válida. Usa números de 0.0 a 5.0`)
        return
      }
      notas.push({ inscripcionId, evaluacionId, valor })
    }
    setGuardando(true)
    try {
      const nueva = await api<Planilla>(`/clases/${claseId}/notas`, { metodo: 'PUT', cuerpo: { notas } })
      actualizar(nueva, `${notas.length} nota(s) guardada(s)`)
    } catch (e) {
      setErrorAccion(textoDeError(e))
    } finally {
      setGuardando(false)
    }
  }

  async function crearEvaluacion(evento: FormEvent) {
    evento.preventDefault()
    try {
      const nueva = await api<Planilla>(`/clases/${claseId}/evaluaciones`, {
        metodo: 'POST',
        cuerpo: { nombre, porcentaje: Number(porcentaje) },
      })
      actualizar(nueva, `Evaluación "${nombre}" creada`)
      setNombre('')
      setPorcentaje('')
    } catch (e) {
      setErrorAccion(textoDeError(e))
    }
  }

  async function eliminarEvaluacion(evaluacion: EvaluacionResumen) {
    if (!window.confirm(`¿Eliminar "${evaluacion.nombre}" y todas sus notas?`)) return
    try {
      const nueva = await api<Planilla>(`/evaluaciones/${evaluacion.id}`, { metodo: 'DELETE' })
      actualizar(nueva, `Evaluación "${evaluacion.nombre}" eliminada`)
    } catch (e) {
      setErrorAccion(textoDeError(e))
    }
  }

  return (
    <section>
      <Aviso>{errorAccion}</Aviso>
      <Aviso tipo="exito">{exito}</Aviso>

      <p className="texto-suave">
        Escribe las notas de 0.0 a 5.0 y pulsa <strong>Guardar notas</strong>. La <strong>definitiva</strong>{' '}
        suma cada nota por su porcentaje; el <strong>promedio actual</strong> muestra cómo va el estudiante
        con lo evaluado hasta ahora.
      </p>

      <div className="tabla-contenedor">
        <table className="tabla planilla">
          <thead>
            <tr>
              <th>Estudiante</th>
              {planilla.evaluaciones.map((e) => (
                <th key={e.id} className="centrado">
                  {e.nombre}
                  <div className="texto-pequeno">
                    {e.porcentaje}%{' '}
                    <button
                      type="button"
                      className="boton-enlace peligro"
                      title={`Eliminar ${e.nombre}`}
                      onClick={() => eliminarEvaluacion(e)}
                    >
                      ✕
                    </button>
                  </div>
                </th>
              ))}
              <th className="centrado">Definitiva</th>
              <th className="centrado">Promedio actual</th>
              <th className="centrado">Asistencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {planilla.filas.map((fila) => (
              <tr key={fila.inscripcionId}>
                <td>
                  {fila.estudiante.nombre}
                  <div className="texto-suave texto-pequeno">{fila.estudiante.codigo}</div>
                </td>
                {planilla.evaluaciones.map((e) => {
                  const k = clave(fila.inscripcionId, e.id)
                  return (
                    <td key={e.id} className="centrado">
                      <input
                        className={`entrada-nota ${celdas[k] !== original[k] ? 'modificada' : ''}`}
                        inputMode="decimal"
                        aria-label={`${e.nombre} de ${fila.estudiante.nombre}`}
                        value={celdas[k] ?? ''}
                        onChange={(ev) => setEditadas({ ...editadas, [k]: ev.target.value })}
                      />
                    </td>
                  )
                })}
                <td className="centrado numeros">{formatoNota(fila.definitiva)}</td>
                <td className="centrado">
                  <EtiquetaNota valor={fila.promedioActual} />
                </td>
                <td className="centrado">
                  <EtiquetaAsistencia valor={fila.asistencia} />
                </td>
                <td>
                  <EtiquetaEstado estado={fila.estado} />
                </td>
              </tr>
            ))}
            {planilla.filas.length === 0 && (
              <tr>
                <td colSpan={planilla.evaluaciones.length + 5} className="texto-suave">
                  No hay estudiantes inscritos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="acciones separado">
        <button
          type="button"
          className="boton"
          disabled={cambios.length === 0 || guardando}
          onClick={guardarNotas}
        >
          {guardando ? 'Guardando…' : `Guardar notas${cambios.length ? ` (${cambios.length})` : ''}`}
        </button>
        {cambios.length > 0 && (
          <button type="button" className="boton boton-secundario" onClick={() => setEditadas({})}>
            Descartar cambios
          </button>
        )}
      </div>

      <form className="tarjeta formulario separado" onSubmit={crearEvaluacion}>
        <h2>Nueva evaluación</h2>
        <p className="texto-suave">
          Porcentaje usado: {planilla.porcentajeTotal}% · Disponible: {disponible}%
        </p>
        <div className="formulario-linea">
          <input
            placeholder="Nombre (ej: Taller 1)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="%"
            min={1}
            max={disponible}
            value={porcentaje}
            onChange={(e) => setPorcentaje(e.target.value)}
            required
            className="entrada-corta"
          />
          <button type="submit" className="boton" disabled={disponible <= 0}>
            Agregar
          </button>
        </div>
      </form>
    </section>
  )
}
