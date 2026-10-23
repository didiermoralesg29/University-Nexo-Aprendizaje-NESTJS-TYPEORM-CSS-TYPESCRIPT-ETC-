import { createContext } from 'react'
import type { Rol, Usuario } from '../api/tipos'

// Un "contexto" de React guarda datos que TODOS los componentes pueden leer
// sin pasarlos de padre a hijo. Aquí guardamos quién inició sesión.
export interface ValorAuth {
  usuario: Usuario | null
  cargando: boolean // true mientras revisamos si ya había una sesión guardada
  iniciarSesion: (email: string, contrasena: string) => Promise<void>
  cerrarSesion: () => void
  actualizarUsuario: (usuario: Usuario) => void
  tieneRol: (...roles: Rol[]) => boolean
}

export const ContextoAuth = createContext<ValorAuth | null>(null)
