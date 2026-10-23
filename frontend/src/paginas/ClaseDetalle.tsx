import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { api, textoDeError } from '../api/cliente'
import type { ClaseDetalle as DatosClase } from '../api/tipos'
import { useAuth } from '../auth/useAuth'
import { useDatos } from '../hooks/useDatos'
import { Aviso } from '../componentes/Aviso'
import { Cargando } from '../componentes/Cargando'
import { FormularioClase } from '../componentes/FormularioClase'
import { PestanaEstudiantes } from './clase/PestanaEstudiantes'
import { PestanaAsistencia } from './clase/PestanaAsistencia'
import { PestanaNotas } from './clase/PestanaNotas'
import { PestanaMaterial } from './clase/PestanaMaterial'

const PESTANAS = [
  { id: 'estudiantes', texto: 'Estudiantes' },
  { id: 'asistencia', texto: 'Asistencia' },
  { id: 'notas', texto: 'Notas' },
  { id: 'material', texto: 'Material' },
]

export function ClaseDetalle() {
  const { id } = useParams() // el :id de la dirección /clases/:id
  const navegar = useNavigate()
  const { tieneRol } = useAuth()
  const { datos: clase, setDatos, cargando, error, recargar } = useDatos<DatosClase>(`/clases/${id}`)
  const [editando, setEditando] = useState(false)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  // La pestaña activa vive en la dirección (?pestana=notas): sobrevive a recargar la página
  const [parametros, setParametros] = useSearchParams()

  if (cargando && !clase) return <Cargando />
  if (error) return <Aviso>{error}</Aviso>
  if (!clase) return null

  // El estudiante solo ve el material; el profesor de la clase y el rector ven todo
  const pestanas = clase.puedeGestionar ? PESTANAS : PESTANAS.filter((p) => p.id === 'material')
  const pestana = pestanas.find((p) => p.id === parametros.get('pestana'))?.id ?? pestanas[0].id

  async function eliminar() {
    if (!clase) return
    const confirmado = window.confirm(
      `¿Eliminar ${clase.asignatura.nombre} (grupo ${clase.grupo})? Se borrarán también sus inscripciones, notas y asistencia.`,
    )
    if (!confirmado) return
    try {
      await api(`/clases/${clase.id}`, { metodo: 'DELETE' })
      navegar('/clases')
    } catch (e) {
      setErrorAccion(textoDeError(e))
    }
  }

  return (
    <>
      <Link to="/clases" className="volver">
        ← Volver a clases
      </Link>
      <div className="encabezado">
        <div>
          <p className="texto-suave codigo">
            {clase.asignatura.codigo} · Grupo {clase.grupo} · {clase.periodo}
          </p>
          <h1>{clase.asignatura.nombre}</h1>
        </div>
        {clase.puedeGestionar && (
          <div className="acciones">
            <Link to={`/reportes/clases/${clase.id}`} className="boton">
              Reporte de notas
            </Link>
            <button type="button" className="boton boton-secundario" onClick={() => setEditando(!editando)}>
              Editar clase
            </button>
            <button type="button" className="boton boton-peligro" onClick={eliminar}>
              Eliminar
            </button>
          </div>
        )}
      </div>

      <Aviso>{errorAccion}</Aviso>

      {editando && (
        <FormularioClase
          clase={clase}
          alGuardar={(actualizada) => {
            setDatos({ ...clase, ...actualizada })
            setEditando(false)
          }}
          alCancelar={() => setEditando(false)}
        />
      )}

      <section className="tarjeta datos-clase">
        <div>
          <span className="dato-etiqueta">Profesor</span>
          {clase.profesor.nombre}
        </div>
        <div>
          <span className="dato-etiqueta">Día</span>
          {clase.dia}
        </div>
        <div>
          <span className="dato-etiqueta">Hora</span>
          {clase.horaInicio} - {clase.horaFin}
        </div>
        <div>
          <span className="dato-etiqueta">Salón</span>
          {clase.salon}
        </div>
        <div>
          <span className="dato-etiqueta">Créditos</span>
          {clase.asignatura.creditos}
        </div>
        <div>
          <span className="dato-etiqueta">Inscritos</span>
          {clase.inscritos} de {clase.cupo}
        </div>
      </section>

      {tieneRol('estudiante') && (
        <p className="texto-suave">
          Tus notas y asistencia de esta materia están en <Link to="/mis-notas">Mis notas</Link>.
        </p>
      )}

      <div className="pestanas" role="tablist">
        {pestanas.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={pestana === p.id}
            className={pestana === p.id ? 'activa' : ''}
            onClick={() => setParametros({ pestana: p.id }, { replace: true })}
          >
            {p.texto}
          </button>
        ))}
      </div>

      {pestana === 'estudiantes' && <PestanaEstudiantes clase={clase} alCambiar={recargar} />}
      {pestana === 'asistencia' && <PestanaAsistencia claseId={clase.id} />}
      {pestana === 'notas' && <PestanaNotas claseId={clase.id} />}
      {pestana === 'material' && <PestanaMaterial claseId={clase.id} puedeSubir={clase.puedeGestionar} />}
    </>
  )
}
