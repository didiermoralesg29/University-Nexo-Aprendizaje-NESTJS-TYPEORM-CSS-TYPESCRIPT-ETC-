import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import type { ClaseResumen } from '../api/tipos'
import { useAuth } from '../auth/useAuth'
import { useDatos } from '../hooks/useDatos'
import { Aviso } from '../componentes/Aviso'
import { Cargando } from '../componentes/Cargando'
import { FormularioClase } from '../componentes/FormularioClase'
import { TablaClases } from '../componentes/TablaClases'

const TITULOS = { estudiante: 'Mi horario', profesor: 'Mis clases', rector: 'Clases' }

export function Clases() {
  const { usuario, tieneRol } = useAuth()
  const navegar = useNavigate()
  // ?nueva=1 en la dirección abre el formulario (lo usan los accesos rápidos)
  const [parametros, setParametros] = useSearchParams()
  const [buscar, setBuscar] = useState('')
  const { datos, cargando, error } = useDatos<ClaseResumen[]>('/clases')

  if (!usuario) return null
  const puedeCrear = tieneRol('profesor', 'rector')
  const mostrarFormulario = puedeCrear && parametros.get('nueva') === '1'

  // Filtro en el navegador: por asignatura, código o profesor
  const texto = buscar.trim().toLowerCase()
  const filtradas = (datos ?? []).filter(
    (c) =>
      !texto ||
      c.asignatura.nombre.toLowerCase().includes(texto) ||
      c.asignatura.codigo.toLowerCase().includes(texto) ||
      c.profesor.nombre.toLowerCase().includes(texto),
  )

  return (
    <>
      <div className="encabezado">
        <div>
          <h1>{TITULOS[usuario.rol]}</h1>
          <p className="subtitulo">
            {usuario.rol === 'estudiante'
              ? 'Las materias que inscribiste este periodo.'
              : 'Entra a una clase para ver sus estudiantes, tomar asistencia y poner notas.'}
          </p>
        </div>
        {puedeCrear && !mostrarFormulario && (
          <button type="button" className="boton" onClick={() => setParametros({ nueva: '1' })}>
            + Nueva clase
          </button>
        )}
      </div>

      {mostrarFormulario && (
        <FormularioClase
          alGuardar={(clase) => navegar(`/clases/${clase.id}`)}
          alCancelar={() => setParametros({})}
        />
      )}

      <Aviso>{error}</Aviso>
      {cargando && <Cargando />}
      {datos && (
        <>
          <input
            type="search"
            className="buscador"
            placeholder="Buscar por asignatura, código o profesor…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
          <TablaClases
            clases={filtradas}
            vacio={usuario.rol === 'estudiante' ? 'Aún no has inscrito materias.' : 'No hay clases.'}
          />
        </>
      )}
    </>
  )
}
