import { useState } from 'react'
import { Link } from 'react-router'
import type { Panel as DatosPanel, Rol } from '../api/tipos'
import { useAuth } from '../auth/useAuth'
import { useDatos } from '../hooks/useDatos'
import { Aviso } from '../componentes/Aviso'
import { Cargando } from '../componentes/Cargando'
import { TablaClases } from '../componentes/TablaClases'

// Accesos rápidos según el rol
const ACCESOS: Record<Rol, { a: string; texto: string }[]> = {
  estudiante: [
    { a: '/inscripcion', texto: 'Inscribir materias' },
    { a: '/mis-notas', texto: 'Ver mis notas' },
    { a: '/material', texto: 'Material de estudio' },
  ],
  profesor: [
    { a: '/clases?nueva=1', texto: 'Crear una clase' },
    { a: '/clases', texto: 'Tomar asistencia y notas' },
    { a: '/reportes', texto: 'Reportes de notas' },
  ],
  rector: [
    { a: '/estudiantes/nuevo', texto: 'Registrar estudiante' },
    { a: '/clases?nueva=1', texto: 'Crear una clase' },
    { a: '/reportes', texto: 'Reportes de notas' },
  ],
}

export function Panel() {
  const { usuario } = useAuth()
  const { datos, cargando, error } = useDatos<DatosPanel>('/panel')
  // La fecha se calcula una sola vez (al crear el componente), no en cada render
  const [hoy] = useState(() =>
    new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }),
  )
  if (!usuario) return null

  const primerNombre = usuario.nombre.split(' ')[0]

  return (
    <>
      <h1>Hola, {primerNombre}</h1>
      <p className="subtitulo">Hoy es {hoy}.</p>

      <Aviso>{error}</Aviso>
      {cargando && <Cargando />}

      {datos && (
        <>
          <section className="estadisticas">
            {datos.tarjetas.map((t) => (
              <div key={t.etiqueta} className="tarjeta estadistica">
                <span className="estadistica-valor">{t.valor}</span>
                <span className="estadistica-etiqueta">{t.etiqueta}</span>
              </div>
            ))}
          </section>

          <section className="seccion">
            <h2>Accesos rápidos</h2>
            <div className="acciones">
              {ACCESOS[usuario.rol].map((acceso) => (
                <Link key={acceso.a} to={acceso.a} className="boton boton-secundario">
                  {acceso.texto}
                </Link>
              ))}
            </div>
          </section>

          <section className="seccion">
            <h2>Clases de hoy</h2>
            <TablaClases clases={datos.clasesHoy} vacio="Hoy no tienes clases programadas." />
          </section>
        </>
      )}
    </>
  )
}
