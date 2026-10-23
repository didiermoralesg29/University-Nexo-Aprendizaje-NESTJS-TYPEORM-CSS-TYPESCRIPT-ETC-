import { useCallback, useEffect, useState } from 'react'
import { api, textoDeError } from '../api/cliente'

// La última respuesta recibida, junto con la "clave" (ruta + versión) que la pidió
interface Resultado<T> {
  clave: string
  datos: T | null
  error: string | null
}

// Hook para CARGAR datos de la API al mostrar un componente.
// Uso: const { datos, cargando, error, recargar } = useDatos<Panel>('/panel')
// Si la ruta cambia (por ejemplo, otra fecha), vuelve a pedir los datos.
// Con ruta = null no pide nada (útil cuando los datos dependen del rol).
//
// ⚠️ Los hooks SIEMPRE se llaman useAlgo: React y sus herramientas los reconocen por el nombre.
export function useDatos<T>(ruta: string | null) {
  const [version, setVersion] = useState(0)
  const [resultado, setResultado] = useState<Resultado<T> | null>(null)
  const clave = `${ruta}#${version}`

  useEffect(() => {
    if (ruta === null) return
    // "cancelado" evita guardar una respuesta vieja si la ruta cambió mientras tanto
    let cancelado = false
    api<T>(ruta)
      .then((datos) => {
        if (!cancelado) setResultado({ clave, datos, error: null })
      })
      .catch((e: unknown) => {
        if (!cancelado) setResultado({ clave, datos: null, error: textoDeError(e) })
      })
    return () => {
      cancelado = true
    }
  }, [ruta, clave])

  // Está cargando si la última respuesta no corresponde a lo que pedimos ahora.
  // Mientras tanto seguimos mostrando los datos anteriores (evita parpadeos).
  const cargando = ruta !== null && resultado?.clave !== clave
  const datos = resultado?.datos ?? null
  const error = cargando ? null : (resultado?.error ?? null)

  // Reemplaza los datos con lo que devolvió el servidor al guardar (sin volver a pedirlos)
  const setDatos = useCallback((nuevos: T) => setResultado({ clave, datos: nuevos, error: null }), [clave])
  // Vuelve a pedir los datos (por ejemplo, después de crear algo)
  const recargar = useCallback(() => setVersion((v) => v + 1), [])

  return { datos, setDatos, error, cargando, recargar }
}
