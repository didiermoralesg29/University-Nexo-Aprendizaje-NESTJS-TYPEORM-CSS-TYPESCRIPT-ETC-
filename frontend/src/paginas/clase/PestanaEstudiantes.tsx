import { useState } from 'react'
import { Link } from 'react-router'
import { api, textoDeError } from '../../api/cliente'
import type { ClaseDetalle, Usuario } from '../../api/tipos'
import { useAuth } from '../../auth/useAuth'
import { useDatos } from '../../hooks/useDatos'
import { Aviso } from '../../componentes/Aviso'

// Lista de estudiantes inscritos. El rector además puede inscribir y retirar.
export function PestanaEstudiantes({ clase, alCambiar }: { clase: ClaseDetalle; alCambiar: () => void }) {
  const { tieneRol } = useAuth()
  const esRector = tieneRol('rector')
  const todos = useDatos<Usuario[]>(esRector ? '/usuarios?rol=estudiante' : null)
  const [estudianteId, setEstudianteId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)

  // Estudiantes activos que todavía no están en la clase
  const idsInscritos = new Set(clase.estudiantes.map((e) => e.id))
  const disponibles = (todos.datos ?? []).filter((e) => e.activo && !idsInscritos.has(e.id))

  async function inscribir() {
    setError(null)
    setExito(null)
    try {
      await api(`/clases/${clase.id}/inscripciones`, {
        metodo: 'POST',
        cuerpo: { estudianteId: Number(estudianteId) },
      })
      setExito('Estudiante inscrito')
      setEstudianteId('')
      alCambiar()
    } catch (e) {
      setError(textoDeError(e))
    }
  }

  async function retirar(id: number, nombre: string) {
    if (!window.confirm(`¿Retirar a ${nombre} de la clase? Se borrarán sus notas y asistencia.`)) return
    setError(null)
    setExito(null)
    try {
      await api(`/clases/${clase.id}/inscripciones/${id}`, { metodo: 'DELETE' })
      setExito(`${nombre} fue retirado de la clase`)
      alCambiar()
    } catch (e) {
      setError(textoDeError(e))
    }
  }

  return (
    <section>
      <Aviso>{error}</Aviso>
      <Aviso tipo="exito">{exito}</Aviso>

      {esRector && (
        <div className="formulario-linea">
          <select value={estudianteId} onChange={(e) => setEstudianteId(e.target.value)}>
            <option value="">Inscribir a un estudiante…</option>
            {disponibles.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre} ({e.codigo})
              </option>
            ))}
          </select>
          <button type="button" className="boton" disabled={!estudianteId} onClick={inscribir}>
            Inscribir
          </button>
        </div>
      )}

      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Código</th>
              <th>Estudiante</th>
              <th>Programa</th>
              <th>Semestre</th>
              <th>Correo</th>
              {esRector && <th />}
            </tr>
          </thead>
          <tbody>
            {clase.estudiantes.map((e) => (
              <tr key={e.id}>
                <td className="numeros">{e.codigo}</td>
                <td>{esRector ? <Link to={`/estudiantes/${e.id}`}>{e.nombre}</Link> : e.nombre}</td>
                <td>{e.programa ?? '—'}</td>
                <td className="numeros">{e.semestre ?? '—'}</td>
                <td>
                  <a href={`mailto:${e.email}`}>{e.email}</a>
                </td>
                {esRector && (
                  <td className="celda-acciones">
                    <button
                      type="button"
                      className="boton-enlace peligro"
                      onClick={() => retirar(e.id, e.nombre)}
                    >
                      Retirar
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {clase.estudiantes.length === 0 && (
              <tr>
                <td colSpan={6} className="texto-suave">
                  Aún no hay estudiantes inscritos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="texto-suave texto-pequeno">
        Las notas, la definitiva y el porcentaje de asistencia de cada estudiante están en la pestaña Notas.
      </p>
    </section>
  )
}
