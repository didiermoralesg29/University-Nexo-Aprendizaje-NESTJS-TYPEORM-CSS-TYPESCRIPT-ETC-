import type { ClaseResumen, Dia, Rol } from '../api/tipos'

// Deben coincidir con backend/src/comun/calculos.ts
export const NOTA_APROBACION = 3
export const ASISTENCIA_MINIMA = 80

export const DIAS: Dia[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const NOMBRES_ROL: Record<Rol, string> = {
  estudiante: 'Estudiante',
  profesor: 'Profesor',
  rector: 'Rector',
}

export function nombreRol(rol: Rol) {
  return NOMBRES_ROL[rol]
}

// 4 -> '4.0' | null -> '—'
export function formatoNota(valor: number | null | undefined) {
  return valor === null || valor === undefined ? '—' : valor.toFixed(1)
}

export function formatoPorcentaje(valor: number | null | undefined) {
  return valor === null || valor === undefined ? '—' : `${valor}%`
}

// '2026-10-22' -> '22/10/2026'
export function formatoFecha(iso: string) {
  const [anio, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

export function formatoFechaHora(iso: string) {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })
}

// Fecha de hoy como 'AAAA-MM-DD' (hora local)
export function hoyISO() {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

export function horario(clase: Pick<ClaseResumen, 'dia' | 'horaInicio' | 'horaFin'>) {
  return `${clase.dia} ${clase.horaInicio} - ${clase.horaFin}`
}

export function nombreClase(clase: Pick<ClaseResumen, 'asignatura' | 'grupo'>) {
  return `${clase.asignatura.nombre} (grupo ${clase.grupo})`
}
