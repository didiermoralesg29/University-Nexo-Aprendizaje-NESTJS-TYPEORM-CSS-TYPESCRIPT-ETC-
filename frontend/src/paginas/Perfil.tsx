import { useState, type FormEvent } from 'react'
import { api, textoDeError } from '../api/cliente'
import type { Usuario } from '../api/tipos'
import { useAuth } from '../auth/useAuth'
import { Aviso } from '../componentes/Aviso'
import { nombreRol } from '../utilidades/formato'

// Mis datos: cualquier usuario puede cambiar su teléfono y su contraseña
export function Perfil() {
  const { usuario, actualizarUsuario } = useAuth()
  const [telefono, setTelefono] = useState(usuario?.telefono ?? '')
  const [contrasena, setContrasena] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)

  if (!usuario) return null

  async function guardar(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    setExito(null)
    if (contrasena && contrasena !== confirmacion) {
      setError('Las contraseñas no coinciden')
      return
    }
    try {
      const actualizado = await api<Usuario>('/auth/perfil', {
        metodo: 'PATCH',
        cuerpo: { telefono, ...(contrasena ? { contrasena } : {}) },
      })
      actualizarUsuario(actualizado)
      setContrasena('')
      setConfirmacion('')
      setExito('Tus datos se guardaron')
    } catch (e) {
      setError(textoDeError(e))
    }
  }

  return (
    <>
      <h1>Mi perfil</h1>
      <section className="tarjeta datos-clase">
        <div>
          <span className="dato-etiqueta">Nombre</span>
          {usuario.nombre}
        </div>
        <div>
          <span className="dato-etiqueta">Correo</span>
          {usuario.email}
        </div>
        <div>
          <span className="dato-etiqueta">Rol</span>
          {nombreRol(usuario.rol)}
        </div>
        {usuario.codigo && (
          <div>
            <span className="dato-etiqueta">Código</span>
            {usuario.codigo}
          </div>
        )}
        {usuario.programa && (
          <div>
            <span className="dato-etiqueta">Programa</span>
            {usuario.programa.nombre}
          </div>
        )}
        {usuario.semestre && (
          <div>
            <span className="dato-etiqueta">Semestre</span>
            {usuario.semestre}
          </div>
        )}
        {usuario.departamento && (
          <div>
            <span className="dato-etiqueta">Departamento</span>
            {usuario.departamento}
          </div>
        )}
      </section>

      <form className="tarjeta formulario" onSubmit={guardar}>
        <h2>Actualizar mis datos</h2>
        <Aviso>{error}</Aviso>
        <Aviso tipo="exito">{exito}</Aviso>
        <div className="campos">
          <label className="campo">
            Teléfono
            <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </label>
          <label className="campo">
            Nueva contraseña
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              minLength={6}
              autoComplete="new-password"
              placeholder="Dejar en blanco para no cambiar"
            />
          </label>
          <label className="campo">
            Repite la contraseña
            <input
              type="password"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              autoComplete="new-password"
            />
          </label>
        </div>
        <button type="submit" className="boton">
          Guardar
        </button>
        <p className="texto-suave texto-pequeno">
          Para cambiar tu nombre, correo o programa, comunícate con rectoría.
        </p>
      </form>
    </>
  )
}
