import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import type { Usuario } from '../api/tipos'
import { useDatos } from '../hooks/useDatos'
import { Aviso } from '../componentes/Aviso'
import { Cargando } from '../componentes/Cargando'

// Lista de estudiantes o de profesores (solo rector)
export function ListaUsuarios({ rol }: { rol: 'estudiante' | 'profesor' }) {
  const esEstudiante = rol === 'estudiante'
  const base = esEstudiante ? '/estudiantes' : '/profesores'
  const ubicacion = useLocation()
  // Mensaje que deja el formulario al guardar (ver FormularioUsuario)
  const mensaje = (ubicacion.state as { mensaje?: string } | null)?.mensaje

  const [texto, setTexto] = useState('')
  const [buscar, setBuscar] = useState('')
  const ruta = `/usuarios?rol=${rol}${buscar ? `&buscar=${encodeURIComponent(buscar)}` : ''}`
  const { datos, cargando, error } = useDatos<Usuario[]>(ruta)

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    setBuscar(texto.trim())
  }

  return (
    <>
      <div className="encabezado">
        <div>
          <h1>{esEstudiante ? 'Estudiantes' : 'Profesores'}</h1>
          <p className="subtitulo">
            {esEstudiante
              ? 'Registra, edita y consulta el boletín de cada estudiante.'
              : 'Docentes de la universidad.'}
          </p>
        </div>
        <Link to={`${base}/nuevo`} className="boton">
          + Registrar {esEstudiante ? 'estudiante' : 'profesor'}
        </Link>
      </div>

      <Aviso tipo="exito">{mensaje}</Aviso>
      <Aviso>{error}</Aviso>

      <form className="formulario-linea" onSubmit={enviar}>
        <input
          type="search"
          className="buscador"
          placeholder={esEstudiante ? 'Buscar por nombre, correo o código…' : 'Buscar por nombre o correo…'}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button type="submit" className="boton boton-secundario">
          Buscar
        </button>
      </form>

      {cargando && <Cargando />}
      {datos && (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                {esEstudiante && <th>Código</th>}
                <th>Nombre</th>
                {esEstudiante ? <th>Programa</th> : <th>Departamento</th>}
                {esEstudiante && <th>Semestre</th>}
                <th>Correo</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {datos.map((u) => (
                <tr key={u.id} className={u.activo ? '' : 'fila-inactiva'}>
                  {esEstudiante && <td className="numeros">{u.codigo}</td>}
                  <td>
                    <strong>{u.nombre}</strong>
                  </td>
                  {esEstudiante ? <td>{u.programa?.nombre ?? '—'}</td> : <td>{u.departamento ?? '—'}</td>}
                  {esEstudiante && <td className="numeros">{u.semestre}</td>}
                  <td>{u.email}</td>
                  <td>
                    <span className={`etiqueta ${u.activo ? 'etiqueta-ok' : 'etiqueta-neutra'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="celda-acciones">
                    <Link to={`${base}/${u.id}`}>Editar</Link>
                    {esEstudiante && (
                      <>
                        {' · '}
                        <Link to={`${base}/${u.id}/boletin`}>Boletín</Link>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {datos.length === 0 && (
                <tr>
                  <td colSpan={7} className="texto-suave">
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
