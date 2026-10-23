// La forma de los datos que devuelve la API (backend).
// Si cambias una respuesta en el backend, actualiza el tipo aquí.

export type Rol = 'estudiante' | 'profesor' | 'rector'

export type Dia = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado'

export type TipoMaterial = 'PDF' | 'Video' | 'Presentación' | 'Enlace'

export type EstadoMateria = 'Aprobada' | 'Reprobada' | 'En curso'

export interface Programa {
  id: number
  nombre: string
  facultad: string
}

export interface Asignatura {
  id: number
  codigo: string
  nombre: string
  creditos: number
  programa: Programa | null
}

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: Rol
  documento: string | null
  telefono: string | null
  activo: boolean
  codigo: string | null
  programa: Programa | null
  semestre: number | null
  departamento: string | null
  creadoEn: string
}

export interface RespuestaLogin {
  token: string
  usuario: Usuario
}

export interface ClaseResumen {
  id: number
  asignatura: { id: number; codigo: string; nombre: string; creditos: number }
  profesor: { id: number; nombre: string }
  periodo: string
  grupo: string
  dia: Dia
  horaInicio: string
  horaFin: string
  salon: string
  cupo: number
  inscritos: number
}

export interface ClaseOferta extends ClaseResumen {
  inscrito: boolean
}

export interface EstudianteDeClase {
  inscripcionId: number
  id: number
  nombre: string
  codigo: string | null
  email: string
  programa: string | null
  semestre: number | null
}

export interface ClaseDetalle extends ClaseResumen {
  puedeGestionar: boolean
  estudiantes: EstudianteDeClase[]
}

export interface EvaluacionResumen {
  id: number
  nombre: string
  porcentaje: number
}

export interface FilaPlanilla {
  inscripcionId: number
  estudiante: { id: number; nombre: string; codigo: string | null }
  valores: (number | null)[] // valores[i] = nota en evaluaciones[i]
  definitiva: number
  promedioActual: number | null
  porcentajeEvaluado: number
  estado: EstadoMateria
  asistencia: number | null
}

export interface Planilla {
  evaluaciones: EvaluacionResumen[]
  porcentajeTotal: number
  filas: FilaPlanilla[]
}

export interface EstadisticasClase {
  estudiantes: number
  promedio: number | null
  enRiesgo: number
  aprobados: number
  reprobados: number
  asistenciaPromedio: number | null
}

export interface ReporteClase extends Planilla {
  clase: ClaseResumen
  resumen: EstadisticasClase
  generadoEn: string
}

export interface ResumenClaseReporte extends EstadisticasClase {
  clase: ClaseResumen
  porcentajeEvaluado: number
}

export interface MateriaBoletin {
  clase: ClaseResumen
  evaluaciones: { nombre: string; porcentaje: number; valor: number | null }[]
  definitiva: number
  promedioActual: number | null
  porcentajeEvaluado: number
  estado: EstadoMateria
  asistencia: number | null
}

export interface Boletin {
  estudiante: {
    id: number
    nombre: string
    codigo: string | null
    email: string
    programa: string | null
    semestre: number | null
  }
  periodo: string
  materias: MateriaBoletin[]
  creditos: number
  promedioPonderado: number | null
  generadoEn: string
}

export interface ConsultaAsistencia {
  fecha: string
  registrada: boolean
  estudiantes: {
    inscripcionId: number
    estudiante: { id: number; nombre: string; codigo: string | null }
    presente: boolean
  }[]
  historial: { fecha: string; presentes: number; total: number; porcentaje: number }[]
}

export interface MaterialItem {
  id: number
  titulo: string
  descripcion: string
  tipo: TipoMaterial
  enlace: string
  creadoEn: string
  clase: { id: number; asignatura: string; grupo: string; profesor: string }
  puedeEliminar: boolean
}

export interface Panel {
  tarjetas: { etiqueta: string; valor: number | string }[]
  clasesHoy: ClaseResumen[]
}
