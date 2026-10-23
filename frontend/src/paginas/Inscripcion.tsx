import { useState } from 'react'
import { api, textoDeError } from '../api/cliente'
import type { ClaseOferta } from '../api/tipos'
import { useAuth } from '../auth/useAuth'
import { useDatos } from '../hooks/useDatos'
import { Aviso } from '../componentes/Aviso'
import { Cargando } from '../componentes/Cargando'
import { TablaClases } from '../componentes/TablaClases'

// El estudiante arma su horario: inscribe y cancela materias del periodo actual
export function Inscripcion() {
  const { usuario } = useAuth()
  const { datos, cargando, error, recargar } = useDatos<ClaseOferta[]>('/clases/oferta')
  const [buscar, setBuscar] = useState('')
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState<number | null>(null) // id de la clase en proceso

  if (!usuario) return null
  const inscritas = (datos ?? []).filter((c) => c.inscrito)
  const texto = buscar.trim().toLowerCase()
  const disponibles = (datos ?? []).filter(
    (c) =>
      !c.inscrito &&
      (!texto ||
        c.asignatura.nombre.toLowerCase().includes(texto) ||
        c.asignatura.codigo.toLowerCase().includes(texto)),
  )
  const creditos = inscritas.reduce((total, c) => total + c.asignatura.creditos, 0)

  async function accion(clase: ClaseOferta, tipo: 'inscribir' | 'cancelar') {
    if (tipo === 'cancelar' && !window.confirm(`¿Cancelar ${clase.asignatura.nombre}? Perderás sus notas.`))
      return
    setErrorAccion(null)
    setExito(null)
    setOcupado(clase.id)
    try {
      if (tipo === 'inscribir') {
        await api(`/clases/${clase.id}/inscripciones`, { metodo: 'POST', cuerpo: {} })
        setExito(`Inscribiste ${clase.asignatura.nombre}`)
      } else {
        await api(`/clases/${clase.id}/inscripciones/${usuario!.id}`, { metodo: 'DELETE' })
        setExito(`Cancelaste ${clase.asignatura.nombre}`)
      }
      recargar()
    } catch (e) {
      setErrorAccion(textoDeError(e))
    } finally {
      setOcupado(null)
    }
  }

  return (
    <>
      <h1>Inscripción de materias</h1>
      <p className="subtitulo">
        Elige tus materias del periodo. El sistema no te deja inscribir dos materias a la misma hora.
      </p>

      <Aviso>{error ?? errorAccion}</Aviso>
      <Aviso tipo="exito">{exito}</Aviso>
      {cargando && !datos && <Cargando />}

      {datos && (
        <>
          <section className="seccion">
            <h2>
              Mis materias ({inscritas.length}) · {creditos} créditos
            </h2>
            <TablaClases
              clases={inscritas}
              vacio="Aún no has inscrito materias."
              acciones={(clase) => (
                <button
                  type="button"
                  className="boton boton-peligro boton-pequeno"
                  disabled={ocupado === clase.id}
                  onClick={() => accion(clase, 'cancelar')}
                >
                  Cancelar
                </button>
              )}
            />
          </section>

          <section className="seccion">
            <h2>Oferta disponible</h2>
            <input
              type="search"
              className="buscador"
              placeholder="Buscar por nombre o código…"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
            <TablaClases
              clases={disponibles}
              enlazar={false}
              vacio="No hay más clases disponibles."
              acciones={(clase) => {
                const lleno = clase.inscritos >= clase.cupo
                return (
                  <button
                    type="button"
                    className="boton boton-pequeno"
                    disabled={lleno || ocupado === clase.id}
                    onClick={() => accion(clase, 'inscribir')}
                  >
                    {lleno ? 'Sin cupo' : 'Inscribir'}
                  </button>
                )
              }}
            />
          </section>
        </>
      )}
    </>
  )
}
