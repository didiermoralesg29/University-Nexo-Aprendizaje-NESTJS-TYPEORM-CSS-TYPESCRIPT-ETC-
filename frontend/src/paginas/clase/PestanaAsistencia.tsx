import { useState } from 'react'
import { api, textoDeError } from '../../api/cliente'
import type { ConsultaAsistencia } from '../../api/tipos'
import { useDatos } from '../../hooks/useDatos'
import { Aviso } from '../../componentes/Aviso'
import { Cargando } from '../../componentes/Cargando'
import { formatoFecha, hoyISO } from '../../utilidades/formato'

export function PestanaAsistencia({ claseId }: { claseId: number }) {
  const [fecha, setFecha] = useState(hoyISO())
  // Al cambiar la fecha cambia la ruta, y useDatos vuelve a pedir los datos
  const { datos, setDatos, cargando, error } = useDatos<ConsultaAsistencia>(
    `/clases/${claseId}/asistencia?fecha=${fecha}`,
  )
  // Lo que el profesor va marcando. null = "aún no ha tocado nada":
  // en ese caso mostramos lo que dice el servidor.
  const [editados, setEditados] = useState<Set<number> | null>(null)
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  // Ids de inscripción presentes: lo editado, o si no, lo que vino del servidor.
  // Se CALCULA en cada render en vez de copiarlo a otro estado.
  const presentes =
    editados ?? new Set(datos?.estudiantes.filter((e) => e.presente).map((e) => e.inscripcionId))

  function cambiarFecha(nueva: string) {
    setFecha(nueva)
    setEditados(null) // la nueva fecha empieza con los datos del servidor
    setExito(null)
  }

  function alternar(inscripcionId: number) {
    const nuevo = new Set(presentes)
    if (nuevo.has(inscripcionId)) nuevo.delete(inscripcionId)
    else nuevo.add(inscripcionId)
    setEditados(nuevo)
  }

  async function guardar() {
    setErrorGuardar(null)
    setExito(null)
    setGuardando(true)
    try {
      const respuesta = await api<ConsultaAsistencia>(`/clases/${claseId}/asistencia`, {
        metodo: 'PUT',
        cuerpo: { fecha, presentes: [...presentes] },
      })
      setDatos(respuesta)
      setEditados(null)
      setExito(`Asistencia del ${formatoFecha(fecha)} guardada`)
    } catch (e) {
      setErrorGuardar(textoDeError(e))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="dos-columnas">
      <section className="tarjeta">
        <h2>Tomar asistencia</h2>
        <label className="formulario-linea">
          Fecha
          <input
            type="date"
            value={fecha}
            max={hoyISO()}
            onChange={(e) => {
              if (e.target.value) cambiarFecha(e.target.value)
            }}
          />
        </label>

        <Aviso>{error ?? errorGuardar}</Aviso>
        <Aviso tipo="exito">{exito}</Aviso>
        {cargando && <Cargando />}

        {datos && !cargando && (
          <>
            <p className="texto-suave">
              {datos.registrada
                ? `Editando la asistencia ya registrada del ${formatoFecha(datos.fecha)}.`
                : `Nueva asistencia del ${formatoFecha(datos.fecha)}. Desmarca a quienes faltaron.`}
            </p>
            <div className="acciones">
              <button
                type="button"
                className="boton boton-secundario boton-pequeno"
                onClick={() => setEditados(new Set(datos.estudiantes.map((e) => e.inscripcionId)))}
              >
                Marcar todos
              </button>
              <button
                type="button"
                className="boton boton-secundario boton-pequeno"
                onClick={() => setEditados(new Set())}
              >
                Desmarcar todos
              </button>
            </div>
            <ul className="lista-asistencia">
              {datos.estudiantes.map((e) => (
                <li key={e.inscripcionId}>
                  <label>
                    <input
                      type="checkbox"
                      checked={presentes.has(e.inscripcionId)}
                      onChange={() => alternar(e.inscripcionId)}
                    />
                    {e.estudiante.nombre}
                  </label>
                  <span className={presentes.has(e.inscripcionId) ? 'texto-ok' : 'texto-alerta'}>
                    {presentes.has(e.inscripcionId) ? 'Presente' : 'Ausente'}
                  </span>
                </li>
              ))}
            </ul>
            {datos.estudiantes.length === 0 ? (
              <p className="texto-suave">No hay estudiantes inscritos.</p>
            ) : (
              <button type="button" className="boton" onClick={guardar} disabled={guardando}>
                {guardando
                  ? 'Guardando…'
                  : `Guardar (${presentes.size} de ${datos.estudiantes.length} presentes)`}
              </button>
            )}
          </>
        )}
      </section>

      <section className="tarjeta">
        <h2>Historial</h2>
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Presentes</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {datos?.historial.map((h) => (
                <tr key={h.fecha} className={h.fecha === fecha ? 'fila-seleccionada' : ''}>
                  <td>
                    <button type="button" className="boton-enlace" onClick={() => cambiarFecha(h.fecha)}>
                      {formatoFecha(h.fecha)}
                    </button>
                  </td>
                  <td className="numeros">
                    {h.presentes} de {h.total}
                  </td>
                  <td className="numeros">{h.porcentaje}%</td>
                </tr>
              ))}
              {datos?.historial.length === 0 && (
                <tr>
                  <td colSpan={3} className="texto-suave">
                    Aún no hay registros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="texto-suave texto-pequeno">Haz clic en una fecha para corregirla.</p>
      </section>
    </div>
  )
}
