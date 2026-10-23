import type { EstadoMateria } from '../api/tipos'
import { ASISTENCIA_MINIMA, NOTA_APROBACION, formatoNota, formatoPorcentaje } from '../utilidades/formato'

// Pequeñas "píldoras" de color: verde = bien, rojo = alerta, gris = sin datos

export function EtiquetaNota({ valor }: { valor: number | null }) {
  if (valor === null) return <span className="etiqueta etiqueta-neutra">—</span>
  const clase = valor >= NOTA_APROBACION ? 'etiqueta-ok' : 'etiqueta-alerta'
  return <span className={`etiqueta ${clase}`}>{formatoNota(valor)}</span>
}

export function EtiquetaAsistencia({ valor }: { valor: number | null }) {
  if (valor === null) return <span className="etiqueta etiqueta-neutra">Sin registros</span>
  const clase = valor >= ASISTENCIA_MINIMA ? 'etiqueta-ok' : 'etiqueta-alerta'
  return <span className={`etiqueta ${clase}`}>{formatoPorcentaje(valor)}</span>
}

const CLASE_ESTADO: Record<EstadoMateria, string> = {
  Aprobada: 'etiqueta-ok',
  Reprobada: 'etiqueta-alerta',
  'En curso': 'etiqueta-info',
}

export function EtiquetaEstado({ estado }: { estado: EstadoMateria }) {
  return <span className={`etiqueta ${CLASE_ESTADO[estado]}`}>{estado}</span>
}
