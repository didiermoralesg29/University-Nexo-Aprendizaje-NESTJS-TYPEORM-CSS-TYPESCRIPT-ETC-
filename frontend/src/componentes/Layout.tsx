import { NavLink, Outlet } from 'react-router'
import type { Rol } from '../api/tipos'
import { useAuth } from '../auth/useAuth'
import { nombreRol } from '../utilidades/formato'

// El menú cambia según el rol: cada rol ve solo lo que puede usar
const MENU: Record<Rol, { a: string; texto: string }[]> = {
  estudiante: [
    { a: '/', texto: 'Inicio' },
    { a: '/clases', texto: 'Mi horario' },
    { a: '/inscripcion', texto: 'Inscribir materias' },
    { a: '/mis-notas', texto: 'Mis notas' },
    { a: '/material', texto: 'Material' },
  ],
  profesor: [
    { a: '/', texto: 'Inicio' },
    { a: '/clases', texto: 'Mis clases' },
    { a: '/material', texto: 'Material' },
    { a: '/reportes', texto: 'Reportes' },
  ],
  rector: [
    { a: '/', texto: 'Inicio' },
    { a: '/clases', texto: 'Clases' },
    { a: '/estudiantes', texto: 'Estudiantes' },
    { a: '/profesores', texto: 'Profesores' },
    { a: '/academico', texto: 'Programas y asignaturas' },
    { a: '/material', texto: 'Material' },
    { a: '/reportes', texto: 'Reportes' },
  ],
}

// Estructura común: barra superior + menú lateral + contenido.
// <Outlet /> es el "hueco" donde React Router pone la página actual.
export function Layout() {
  const { usuario, cerrarSesion } = useAuth()
  if (!usuario) return null

  return (
    <div className="app">
      <header className="barra">
        <NavLink to="/" className="marca">
          <span className="marca-logo" aria-hidden="true">
            N
          </span>
          Nexo University
        </NavLink>
        <div className="barra-usuario">
          <NavLink to="/perfil" className="barra-perfil">
            <strong>{usuario.nombre}</strong>
            <span className="etiqueta etiqueta-rol">{nombreRol(usuario.rol)}</span>
          </NavLink>
          <button type="button" className="boton boton-claro" onClick={cerrarSesion}>
            Salir
          </button>
        </div>
      </header>

      <nav className="menu" aria-label="Menú principal">
        {MENU[usuario.rol].map((item) => (
          // "end" en Inicio: solo se marca activo en "/" exacto
          <NavLink key={item.a} to={item.a} end={item.a === '/'}>
            {item.texto}
          </NavLink>
        ))}
      </nav>

      <main className="contenido">
        <Outlet />
      </main>
    </div>
  )
}
