import {
  calcularDefinitiva,
  estadoMateria,
  porcentajeAsistencia,
  promedioPonderado,
} from './calculos.js';
import { seCruzan } from './horarios.js';

describe('calcularDefinitiva', () => {
  it('suma cada nota multiplicada por su porcentaje', () => {
    const resultado = calcularDefinitiva([
      { porcentaje: 30, valor: 4.0 }, // aporta 1.2
      { porcentaje: 30, valor: 3.0 }, // aporta 0.9
      { porcentaje: 40, valor: 5.0 }, // aporta 2.0
    ]);
    expect(resultado).toEqual({
      definitiva: 4.1,
      promedioActual: 4.1,
      porcentajeEvaluado: 100,
    });
  });

  it('ignora las evaluaciones que aún no tienen nota', () => {
    const resultado = calcularDefinitiva([
      { porcentaje: 30, valor: 4.0 },
      { porcentaje: 70, valor: null },
    ]);
    // Acumulado 1.2, pero con lo evaluado hasta ahora va en 4.0
    expect(resultado).toEqual({
      definitiva: 1.2,
      promedioActual: 4.0,
      porcentajeEvaluado: 30,
    });
  });

  it('sin notas no hay promedio actual', () => {
    expect(
      calcularDefinitiva([{ porcentaje: 30, valor: null }]).promedioActual,
    ).toBeNull();
  });
});

describe('estadoMateria', () => {
  it('está en curso si no se ha evaluado el 100%', () => {
    expect(estadoMateria(4.5, 60)).toBe('En curso');
  });

  it('aprueba con 3.0 o más', () => {
    expect(estadoMateria(3.0, 100)).toBe('Aprobada');
    expect(estadoMateria(2.9, 100)).toBe('Reprobada');
  });

  it('reprueba por fallas aunque la nota sea buena', () => {
    expect(estadoMateria(4.5, 100, 70)).toBe('Reprobada');
    expect(estadoMateria(4.5, 100, 80)).toBe('Aprobada');
  });
});

describe('porcentajeAsistencia', () => {
  it('devuelve null si no hay registros', () => {
    expect(porcentajeAsistencia([])).toBeNull();
  });

  it('calcula el porcentaje de presentes', () => {
    const registros = [
      { presente: true },
      { presente: true },
      { presente: false },
      { presente: true },
    ];
    expect(porcentajeAsistencia(registros)).toBe(75);
  });
});

describe('promedioPonderado', () => {
  it('pondera por créditos', () => {
    // (4.0 × 4 + 3.0 × 2) / 6 = 3.67
    const promedio = promedioPonderado([
      { definitiva: 4.0, creditos: 4 },
      { definitiva: 3.0, creditos: 2 },
    ]);
    expect(promedio).toBe(3.67);
  });
});

describe('seCruzan', () => {
  const lunes7a9 = { dia: 'Lunes', horaInicio: '07:00', horaFin: '09:00' };

  it('detecta horarios que se solapan', () => {
    expect(
      seCruzan(lunes7a9, {
        dia: 'Lunes',
        horaInicio: '08:00',
        horaFin: '10:00',
      }),
    ).toBe(true);
  });

  it('permite una clase justo después de otra', () => {
    expect(
      seCruzan(lunes7a9, {
        dia: 'Lunes',
        horaInicio: '09:00',
        horaFin: '11:00',
      }),
    ).toBe(false);
  });

  it('no hay cruce en días distintos', () => {
    expect(
      seCruzan(lunes7a9, {
        dia: 'Martes',
        horaInicio: '07:00',
        horaFin: '09:00',
      }),
    ).toBe(false);
  });
});
