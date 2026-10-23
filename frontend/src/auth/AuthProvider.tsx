import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, borrarToken, guardarToken, leerToken, registrarAlExpirarSesion } from '../api/cliente'
import type { RespuestaLogin, Rol, Usuario } from '../api/tipos'
import { ContextoAuth } from './contexto'

// Envuelve toda la app (ver main.tsx) y entrega el usuario a quien lo pida con useAuth()
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  // Si hay un token guardado, empezamos "cargando" hasta confirmar que sigue válido
  const [cargando, setCargando] = useState(() => leerToken() !== null)

  const cerrarSesion = useCallback(() => {
    borrarToken()
    setUsuario(null)
  }, [])

  // Al abrir la página: si había token, pedimos el perfil para recuperar la sesión
  useEffect(() => {
    registrarAlExpirarSesion(cerrarSesion)
    if (!leerToken()) return
    api<Usuario>('/auth/perfil')
      .then(setUsuario)
      .catch(() => cerrarSesion())
      .finally(() => setCargando(false))
  }, [cerrarSesion])

  const iniciarSesion = useCallback(async (email: string, contrasena: string) => {
    const respuesta = await api<RespuestaLogin>('/auth/login', {
      metodo: 'POST',
      cuerpo: { email, contrasena },
    })
    guardarToken(respuesta.token)
    setUsuario(respuesta.usuario)
  }, [])

  // useMemo: solo crea un objeto nuevo cuando algo cambia (evita renders de más)
  const valor = useMemo(
    () => ({
      usuario,
      cargando,
      iniciarSesion,
      cerrarSesion,
      actualizarUsuario: setUsuario,
      tieneRol: (...roles: Rol[]) => usuario !== null && roles.includes(usuario.rol),
    }),
    [usuario, cargando, iniciarSesion, cerrarSesion],
  )

  return <ContextoAuth.Provider value={valor}>{children}</ContextoAuth.Provider>
}
