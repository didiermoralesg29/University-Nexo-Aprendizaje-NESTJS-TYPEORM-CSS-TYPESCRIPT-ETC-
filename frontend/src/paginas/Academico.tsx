import { useState, type FormEvent } from 'react'
import { api, textoDeError } from '../api/cliente'
import type { Asignatura, Programa } from '../api/tipos'
import { useDatos } from '../hooks/useDatos'
import { Aviso } from '../componentes/Aviso'
import { Cargando } from '../componentes/Cargando'

// Programas (carreras) y asignaturas del plan de estudios. Solo rector.
export function Academico() {
  const programas = useDatos<Programa[]>('/programas')
  const asignaturas = useDatos<Asignatura[]>('/asignaturas')
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)

  // Formulario de programa
  const [nombrePrograma, setNombrePrograma] = useState('')
  const [facultad, setFacultad] = useState('')
  // Formulario de asignatura
  const [codigo, setCodigo] = useState('')
  const [nombreAsignatura, setNombreAsignatura] = useState('')
  const [creditos, setCreditos] = useState('3')
  const [programaId, setProgramaId] = useState('')

  async function crearPrograma(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    try {
      await api('/programas', { metodo: 'POST', cuerpo: { nombre: nombrePrograma, facultad } })
      setExito(`Programa "${nombrePrograma}" creado`)
      setNombrePrograma('')
      setFacultad('')
      programas.recargar()
    } catch (e) {
      setError(textoDeError(e))
    }
  }

  async function crearAsignatura(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    try {
      await api('/asignaturas', {
        metodo: 'POST',
        cuerpo: {
          codigo,
          nombre: nombreAsignatura,
          creditos: Number(creditos),
          ...(programaId ? { programaId: Number(programaId) } : {}),
        },
      })
      setExito(`Asignatura "${nombreAsignatura}" creada`)
      setCodigo('')
      setNombreAsignatura('')
      asignaturas.recargar()
    } catch (e) {
      setError(textoDeError(e))
    }
  }

  return (
    <>
      <h1>Programas y asignaturas</h1>
      <p className="subtitulo">El plan de estudios de la universidad.</p>

      <Aviso>{error ?? programas.error ?? asignaturas.error}</Aviso>
      <Aviso tipo="exito">{exito}</Aviso>

      <section className="seccion">
        <h2>Programas</h2>
        {programas.cargando && <Cargando />}
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Programa</th>
                <th>Facultad</th>
              </tr>
            </thead>
            <tbody>
              {programas.datos?.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.nombre}</strong>
                  </td>
                  <td>{p.facultad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form className="formulario-linea separado" onSubmit={crearPrograma}>
          <input
            placeholder="Nombre del programa"
            value={nombrePrograma}
            onChange={(e) => setNombrePrograma(e.target.value)}
            required
          />
          <input
            placeholder="Facultad"
            value={facultad}
            onChange={(e) => setFacultad(e.target.value)}
            required
          />
          <button type="submit" className="boton">
            Agregar programa
          </button>
        </form>
      </section>

      <section className="seccion">
        <h2>Asignaturas</h2>
        {asignaturas.cargando && <Cargando />}
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Asignatura</th>
                <th>Créditos</th>
                <th>Programa</th>
              </tr>
            </thead>
            <tbody>
              {asignaturas.datos?.map((a) => (
                <tr key={a.id}>
                  <td className="numeros">{a.codigo}</td>
                  <td>
                    <strong>{a.nombre}</strong>
                  </td>
                  <td className="numeros">{a.creditos}</td>
                  <td>{a.programa?.nombre ?? <span className="texto-suave">Transversal</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form className="formulario-linea separado" onSubmit={crearAsignatura}>
          <input
            placeholder="Código (ej: IS301)"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
            className="entrada-corta"
          />
          <input
            placeholder="Nombre"
            value={nombreAsignatura}
            onChange={(e) => setNombreAsignatura(e.target.value)}
            required
          />
          <input
            type="number"
            min={1}
            max={10}
            value={creditos}
            onChange={(e) => setCreditos(e.target.value)}
            required
            className="entrada-corta"
            aria-label="Créditos"
          />
          <select value={programaId} onChange={(e) => setProgramaId(e.target.value)}>
            <option value="">Transversal (todos)</option>
            {programas.datos?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <button type="submit" className="boton">
            Agregar asignatura
          </button>
        </form>
      </section>
    </>
  )
}
