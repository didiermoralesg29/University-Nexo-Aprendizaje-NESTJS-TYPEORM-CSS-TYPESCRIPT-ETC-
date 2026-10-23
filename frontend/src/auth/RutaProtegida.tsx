import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import type { Rol } from '../api/tipos'
import { useAuth } from './useAuth'
import { Cargando } from '../componentes/Cargando'

// Protege una página:
//  - sin sesión -> manda al login (y luego vuelve aquí)
//  - con un rol no permitido -> muestra "sin permiso"
// ⚠️ Esto solo ESCONDE pantallas. La seguridad real está en el backend,
//    que revisa el rol en cada petición (RolesGuard).
export function RutaProtegida({ roles, children }: { roles?: Rol[]; children: ReactNode }) {
  const { usuario, cargando } = useAuth()
  const ubicacion = useLocation()

  if (cargando) return <Cargando />
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />

  if (roles && !roles.includes(usuario.rol)) {
    return (
      <div className="tarjeta vacio">
        <h1>Sin permiso</h1>
        <p>Tu rol no tiene acceso a esta sección.</p>
        <Link to="/" className="boton">
          Volver al inicio
        </Link>
      </div>
    )
  }
  return children
}
