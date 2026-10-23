export const DIAS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const;
export type Dia = (typeof DIAS)[number];

const NOMBRES_DIAS = ['Domingo', ...DIAS];

// Periodo académico según la fecha: enero-junio = '-1', julio-diciembre = '-2'
export function periodoActual(fecha = new Date()): string {
  const semestre = fecha.getMonth() < 6 ? 1 : 2;
  return `${fecha.getFullYear()}-${semestre}`;
}

// Convierte una fecha a texto 'AAAA-MM-DD' usando la hora local
export function fechaISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

// 'Lunes', 'Martes'... para una fecha
export function nombreDia(fecha: Date): string {
  return NOMBRES_DIAS[fecha.getDay()];
}

// Fecha del último `dia` antes de `desde`, retrocediendo `semanasAtras` semanas más
export function fechaAnterior(dia: Dia, desde: Date, semanasAtras: number) {
  const numeroDia = DIAS.indexOf(dia) + 1; // Lunes = 1 ... Sábado = 6
  const fecha = new Date(desde);
  do {
    fecha.setDate(fecha.getDate() - 1);
  } while (fecha.getDay() !== numeroDia);
  fecha.setDate(fecha.getDate() - semanasAtras * 7);
  return fecha;
}

interface Horario {
  dia: string;
  horaInicio: string;
  horaFin: string;
}

// ¿Dos horarios se cruzan? Mismo día y los rangos de hora se solapan.
// Como las horas son 'HH:mm', se pueden comparar como texto.
export function seCruzan(a: Horario, b: Horario): boolean {
  return (
    a.dia === b.dia && a.horaInicio < b.horaFin && b.horaInicio < a.horaFin
  );
}
