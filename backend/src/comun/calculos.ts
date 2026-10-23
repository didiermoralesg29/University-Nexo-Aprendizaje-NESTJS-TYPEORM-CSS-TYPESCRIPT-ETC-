// Reglas académicas de Nexo University: cámbialas aquí y se aplican en todo el sistema
export const NOTA_MINIMA = 0;
export const NOTA_MAXIMA = 5;
export const NOTA_APROBACION = 3.0;
export const ASISTENCIA_MINIMA = 80; // porcentaje

export type EstadoMateria = 'Aprobada' | 'Reprobada' | 'En curso';

export function redondear(valor: number, decimales = 1): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

export function porcentaje(parte: number, total: number): number {
  return total === 0 ? 0 : Math.round((parte / total) * 100);
}

// Nota definitiva ACUMULADA, como se calcula en las universidades colombianas:
// cada nota pesa su porcentaje. Ejemplo: 4.0 en un 30% aporta 1.2.
// Las evaluaciones sin nota todavía no aportan nada.
//
// promedioActual = cómo va el estudiante con lo evaluado hasta ahora.
// Ejemplo: 4.0 en el 30% evaluado -> definitiva 1.2, pero promedio actual 4.0.
export function calcularDefinitiva(
  items: { porcentaje: number; valor: number | null }[],
) {
  let acumulado = 0;
  let porcentajeEvaluado = 0;
  for (const item of items) {
    if (item.valor === null) continue;
    acumulado += (item.valor * item.porcentaje) / 100;
    porcentajeEvaluado += item.porcentaje;
  }
  return {
    definitiva: redondear(acumulado),
    promedioActual:
      porcentajeEvaluado > 0
        ? redondear((acumulado * 100) / porcentajeEvaluado)
        : null,
    porcentajeEvaluado,
  };
}

// Mientras no se haya evaluado el 100%, la materia sigue "En curso".
// Al terminar se aprueba con 3.0 o más Y con la asistencia mínima:
// faltar a más del 20% de las clases hace perder la materia ("pérdida por fallas").
export function estadoMateria(
  definitiva: number,
  porcentajeEvaluado: number,
  asistencia: number | null = null,
): EstadoMateria {
  if (porcentajeEvaluado < 100) return 'En curso';
  if (asistencia !== null && asistencia < ASISTENCIA_MINIMA) return 'Reprobada';
  return definitiva >= NOTA_APROBACION ? 'Aprobada' : 'Reprobada';
}

// Porcentaje de asistencia (null si aún no hay registros)
export function porcentajeAsistencia(
  registros: { presente: boolean }[],
): number | null {
  if (registros.length === 0) return null;
  const presentes = registros.filter((r) => r.presente).length;
  return porcentaje(presentes, registros.length);
}

// Promedio ponderado por créditos: las materias con más créditos pesan más
export function promedioPonderado(
  materias: { definitiva: number; creditos: number }[],
): number | null {
  const creditos = materias.reduce((total, m) => total + m.creditos, 0);
  if (creditos === 0) return null;
  const suma = materias.reduce(
    (total, m) => total + m.definitiva * m.creditos,
    0,
  );
  return redondear(suma / creditos, 2);
}
