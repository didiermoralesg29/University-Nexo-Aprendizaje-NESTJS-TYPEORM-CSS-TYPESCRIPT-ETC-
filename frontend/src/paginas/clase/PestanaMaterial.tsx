import { useState, type FormEvent } from 'react'
import { api, textoDeError } from '../../api/cliente'
import type { MaterialItem, TipoMaterial } from '../../api/tipos'
import { useDatos } from '../../hooks/useDatos'
import { Aviso } from '../../componentes/Aviso'
import { Cargando } from '../../componentes/Cargando'
import { ListaMaterial } from '../../componentes/ListaMaterial'

const TIPOS: TipoMaterial[] = ['PDF', 'Video', 'Presentación', 'Enlace']

export function PestanaMaterial({ claseId, puedeSubir }: { claseId: number; puedeSubir: boolean }) {
  const { datos, cargando, error, recargar } = useDatos<MaterialItem[]>(`/material?claseId=${claseId}`)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState<TipoMaterial>('PDF')
  const [enlace, setEnlace] = useState('')
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)

  async function subir(evento: FormEvent) {
    evento.preventDefault()
    setErrorAccion(null)
    try {
      await api(`/clases/${claseId}/material`, {
        metodo: 'POST',
        cuerpo: { titulo, descripcion, tipo, enlace },
      })
      setExito(`"${titulo}" publicado`)
      setTitulo('')
      setDescripcion('')
      setEnlace('')
      recargar()
    } catch (e) {
      setErrorAccion(textoDeError(e))
    }
  }

  async function eliminar(material: MaterialItem) {
    if (!window.confirm(`¿Eliminar "${material.titulo}"?`)) return
    try {
      await api(`/material/${material.id}`, { metodo: 'DELETE' })
      setExito(`"${material.titulo}" eliminado`)
      recargar()
    } catch (e) {
      setErrorAccion(textoDeError(e))
    }
  }

  return (
    <section>
      <Aviso>{error ?? errorAccion}</Aviso>
      <Aviso tipo="exito">{exito}</Aviso>

      {puedeSubir && (
        <form className="tarjeta formulario" onSubmit={subir}>
          <h2>Publicar material</h2>
          <div className="campos">
            <label className="campo campo-ancho">
              Título
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </label>
            <label className="campo">
              Tipo
              <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoMaterial)}>
                {TIPOS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="campo campo-ancho">
              Enlace
              <input
                type="url"
                value={enlace}
                onChange={(e) => setEnlace(e.target.value)}
                required
                placeholder="https://drive.google.com/…"
              />
            </label>
            <label className="campo campo-completo">
              Descripción (opcional)
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} />
            </label>
          </div>
          <button type="submit" className="boton">
            Publicar
          </button>
        </form>
      )}

      {cargando && <Cargando />}
      {datos && <ListaMaterial materiales={datos} alEliminar={eliminar} />}
    </section>
  )
}
