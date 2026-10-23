import { useState, type FormEvent } from 'react'
import { api, textoDeError } from '../api/cliente'
import type { Asignatura, ClaseResumen, Dia, Usuario } from '../api/tipos'
import { useAuth } from '../auth/useAuth'
import { useDatos } from '../hooks/useDatos'
import { DIAS } from '../utilidades/formato'
import { Aviso } from './Aviso'

// Formulario para CREAR una clase (sin "clase") o EDITARLA (con "clase").
// El rector elige el profesor; un profesor siempre crea clases a su nombre.
export function FormularioClase({
  clase,
  alGuardar,
  alCancelar,
}: {
  clase?: ClaseResumen
  alGuardar: (clase: ClaseResumen) => void
  alCancelar: () => void
}) {
  const { tieneRol } = useAuth()
  const esRector = tieneRol('rector')
  const editando = clase !== undefined

  const asignaturas = useDatos<Asignatura[]>(editando ? null : '/asignaturas')
  const profesores = useDatos<Usuario[]>(esRector ? '/usuarios?rol=profesor' : null)

  // Un estado por campo del formulario
  const [asignaturaId, setAsignaturaId] = useState('')
  const [profesorId, setProfesorId] = useState(clase ? String(clase.profesor.id) : '')
  const [grupo, setGrupo] = useState(clase?.grupo ?? 'A')
  const [dia, setDia] = useState<Dia>(clase?.dia ?? 'Lunes')
  const [horaInicio, setHoraInicio] = useState(clase?.horaInicio ?? '07:00')
  const [horaFin, setHoraFin] = useState(clase?.horaFin ?? '09:00')
  const [salon, setSalon] = useState(clase?.salon ?? '')
  const [cupo, setCupo] = useState(String(clase?.cupo ?? 30))
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault() // evita que el navegador recargue la página
    setError(null)
    setGuardando(true)
    const datos = {
      ...(editando ? {} : { asignaturaId: Number(asignaturaId) }),
      ...(esRector ? { profesorId: Number(profesorId) } : {}),
      grupo,
      dia,
      horaInicio,
      horaFin,
      salon,
      cupo: Number(cupo),
    }
    try {
      const guardada = editando
        ? await api<ClaseResumen>(`/clases/${clase.id}`, { metodo: 'PATCH', cuerpo: datos })
        : await api<ClaseResumen>('/clases', { metodo: 'POST', cuerpo: datos })
      alGuardar(guardada)
    } catch (e) {
      setError(textoDeError(e))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="tarjeta formulario" onSubmit={enviar}>
      <h2>{editando ? 'Editar clase' : 'Nueva clase'}</h2>
      <Aviso>{error ?? asignaturas.error ?? profesores.error}</Aviso>

      <div className="campos">
        {!editando && (
          <label className="campo campo-ancho">
            Asignatura
            <select value={asignaturaId} onChange={(e) => setAsignaturaId(e.target.value)} required>
              <option value="">Elige una asignatura…</option>
              {asignaturas.datos?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.codigo} - {a.nombre} ({a.creditos} créditos)
                </option>
              ))}
            </select>
          </label>
        )}

        {esRector && (
          <label className="campo campo-ancho">
            Profesor
            <select value={profesorId} onChange={(e) => setProfesorId(e.target.value)} required>
              <option value="">Elige un profesor…</option>
              {profesores.datos
                ?.filter((p) => p.activo)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                    {p.departamento ? ` (${p.departamento})` : ''}
                  </option>
                ))}
            </select>
          </label>
        )}

        <label className="campo">
          Grupo
          <input value={grupo} onChange={(e) => setGrupo(e.target.value)} required maxLength={5} />
        </label>
        <label className="campo">
          Día
          <select value={dia} onChange={(e) => setDia(e.target.value as Dia)}>
            {DIAS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="campo">
          Hora de inicio
          <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
        </label>
        <label className="campo">
          Hora de fin
          <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} required />
        </label>
        <label className="campo">
          Salón
          <input value={salon} onChange={(e) => setSalon(e.target.value)} required placeholder="B-201" />
        </label>
        <label className="campo">
          Cupo
          <input
            type="number"
            min={1}
            max={200}
            value={cupo}
            onChange={(e) => setCupo(e.target.value)}
            required
          />
        </label>
      </div>

      <div className="acciones">
        <button type="submit" className="boton" disabled={guardando}>
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear clase'}
        </button>
        <button type="button" className="boton boton-secundario" onClick={alCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
