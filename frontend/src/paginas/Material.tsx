import { useState } from 'react'
import type { MaterialItem } from '../api/tipos'
import { useAuth } from '../auth/useAuth'
import { useDatos } from '../hooks/useDatos'
import { Aviso } from '../componentes/Aviso'
import { Cargando } from '../componentes/Cargando'
import { ListaMaterial } from '../componentes/ListaMaterial'

// Todo el material que le corresponde al usuario, con filtro por asignatura
export function Material() {
  const { tieneRol } = useAuth()
  const { datos, cargando, error } = useDatos<MaterialItem[]>('/material')
  const [claseId, setClaseId] = useState('')

  // Lista de clases sin repetir, para el <select> del filtro
  const clases = new Map<number, string>()
  for (const m of datos ?? []) {
    clases.set(m.clase.id, `${m.clase.asignatura} (grupo ${m.clase.grupo})`)
  }
  const filtrados = (datos ?? []).filter((m) => !claseId || m.clase.id === Number(claseId))

  return (
    <>
      <h1>Material de estudio</h1>
      <p className="subtitulo">
        Guías, videos y enlaces de tus clases.
        {tieneRol('profesor', 'rector') &&
          ' Para publicar material, entra a la clase y abre la pestaña Material.'}
      </p>

      <Aviso>{error}</Aviso>
      {cargando && <Cargando />}

      {datos && (
        <>
          <label className="formulario-linea">
            Asignatura
            <select value={claseId} onChange={(e) => setClaseId(e.target.value)}>
              <option value="">Todas</option>
              {[...clases].map(([id, nombre]) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>
          </label>
          <ListaMaterial materiales={filtrados} />
        </>
      )}
    </>
  )
}
