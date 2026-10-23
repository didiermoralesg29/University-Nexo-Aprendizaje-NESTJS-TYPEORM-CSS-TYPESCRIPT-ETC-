// Todas las peticiones al backend pasan por aquí.
// Se encarga de: agregar el token, convertir a JSON y traducir los errores.

const CLAVE_TOKEN = 'nexo_token'

// Error con el código HTTP (401, 403, 404...) y un mensaje para mostrar
export class ErrorApi extends Error {
  estado: number

  constructor(estado: number, mensaje: string) {
    super(mensaje)
    this.estado = estado
  }
}

// ---------- El token se guarda en el navegador (localStorage) ----------
// try/catch: en modo privado o con almacenamiento bloqueado, localStorage puede fallar

export function leerToken(): string | null {
  try {
    return localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

export function guardarToken(token: string) {
  try {
    localStorage.setItem(CLAVE_TOKEN, token)
  } catch {
    // Sin almacenamiento la sesión dura hasta recargar la página
  }
}

export function borrarToken() {
  try {
    localStorage.removeItem(CLAVE_TOKEN)
  } catch {
    // nada que borrar
  }
}

// El AuthProvider registra aquí qué hacer cuando la sesión expira (401)
let alExpirarSesion: (() => void) | null = null
export function registrarAlExpirarSesion(funcion: () => void) {
  alExpirarSesion = funcion
}

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Uso: const clases = await api<ClaseResumen[]>('/clases')
//      await api('/clases', { metodo: 'POST', cuerpo: { ... } })
export async function api<T>(ruta: string, opciones: { metodo?: Metodo; cuerpo?: unknown } = {}): Promise<T> {
  const token = leerToken()
  const cabeceras: Record<string, string> = {}
  if (opciones.cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'
  if (token) cabeceras.Authorization = `Bearer ${token}`

  let respuesta: Response
  try {
    respuesta = await fetch(`/api${ruta}`, {
      method: opciones.metodo ?? 'GET',
      headers: cabeceras,
      body: opciones.cuerpo === undefined ? undefined : JSON.stringify(opciones.cuerpo),
    })
  } catch {
    throw new ErrorApi(0, 'No hay conexión con el servidor. Revisa tu red.')
  }

  if (respuesta.status === 401 && token) {
    alExpirarSesion?.()
  }

  if (!respuesta.ok) {
    throw new ErrorApi(respuesta.status, await mensajeDeError(respuesta))
  }

  // 204 = "sin contenido" (por ejemplo, al eliminar)
  if (respuesta.status === 204) return undefined as T
  return (await respuesta.json()) as T
}

// NestJS responde los errores así: { message: 'texto' } o { message: ['a', 'b'] }
async function mensajeDeError(respuesta: Response): Promise<string> {
  try {
    const datos = (await respuesta.json()) as { message?: string | string[] }
    if (Array.isArray(datos.message)) return datos.message.join('. ')
    if (datos.message) return datos.message
  } catch {
    // La respuesta no era JSON: casi siempre significa que el backend está apagado
    if (respuesta.status >= 500) {
      return 'No se pudo conectar con el backend. ¿Está encendido? (npm run dev:backend)'
    }
  }
  return `Error inesperado (${respuesta.status})`
}

// Para mostrar cualquier error capturado en un catch
export function textoDeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Error inesperado'
}
