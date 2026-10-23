import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity.js';
import { Inscripcion } from '../clases/inscripcion.entity.js';
import { ClasesService } from '../clases/clases.service.js';
import { CalificacionesService } from '../calificaciones/calificaciones.service.js';
import {
  NOTA_APROBACION,
  promedioPonderado,
  redondear,
} from '../comun/calculos.js';
import { periodoActual } from '../comun/horarios.js';
import type { UsuarioSesion } from '../auth/usuario-sesion.js';

function promedio(valores: number[]) {
  if (valores.length === 0) return null;
  return redondear(valores.reduce((a, b) => a + b, 0) / valores.length);
}

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Inscripcion)
    private readonly inscripciones: Repository<Inscripcion>,
    private readonly clasesService: ClasesService,
    private readonly calificacionesService: CalificacionesService,
  ) {}

  // ===== Reporte de notas de una clase (profesor de la clase o rector) =====
  async reporteClase(claseId: number, usuario: UsuarioSesion) {
    const clase = await this.clasesService.buscarParaGestionar(
      claseId,
      usuario,
    );
    const planilla = await this.calificacionesService.construirPlanilla(clase);
    return {
      clase: await this.clasesService.resumir(clase),
      ...planilla,
      resumen: this.estadisticas(planilla.filas),
      generadoEn: new Date().toISOString(),
    };
  }

  // ===== Boletín de un estudiante (el propio estudiante o el rector) =====
  async boletin(estudianteId: number, usuario: UsuarioSesion) {
    if (usuario.rol === 'profesor') {
      throw new ForbiddenException(
        'Los profesores ven las notas desde sus clases',
      );
    }
    if (usuario.rol === 'estudiante' && usuario.id !== estudianteId) {
      throw new ForbiddenException('Solo puedes ver tu propio boletín');
    }

    const estudiante = await this.usuarios.findOneBy({
      id: estudianteId,
      rol: 'estudiante',
    });
    if (!estudiante) {
      throw new NotFoundException(`No existe el estudiante ${estudianteId}`);
    }

    const inscripciones = await this.inscripciones.find({
      where: { estudiante: { id: estudianteId } },
      relations: { clase: true, notas: true, asistencias: true },
      order: { clase: { periodo: 'DESC', dia: 'ASC', horaInicio: 'ASC' } },
    });

    const materias = await Promise.all(
      inscripciones.map(async (inscripcion) => {
        const clase = inscripcion.clase;
        const evaluaciones =
          await this.calificacionesService.evaluacionesDeClase(clase.id);
        const resumen = this.calificacionesService.resumirInscripcion(
          inscripcion,
          evaluaciones,
        );
        return {
          clase: await this.clasesService.resumir(clase),
          evaluaciones: evaluaciones.map((e, i) => ({
            nombre: e.nombre,
            porcentaje: e.porcentaje,
            valor: resumen.valores[i],
          })),
          definitiva: resumen.definitiva,
          promedioActual: resumen.promedioActual,
          porcentajeEvaluado: resumen.porcentajeEvaluado,
          estado: resumen.estado,
          asistencia: resumen.asistencia,
        };
      }),
    );

    // Promedio ponderado por créditos, con lo evaluado hasta ahora
    const conNotas = materias.filter((m) => m.promedioActual !== null);
    return {
      estudiante: {
        id: estudiante.id,
        nombre: estudiante.nombre,
        codigo: estudiante.codigo,
        email: estudiante.email,
        programa: estudiante.programa?.nombre ?? null,
        semestre: estudiante.semestre,
      },
      periodo: periodoActual(),
      materias,
      creditos: materias.reduce(
        (total, m) => total + m.clase.asignatura.creditos,
        0,
      ),
      promedioPonderado: promedioPonderado(
        conNotas.map((m) => ({
          definitiva: m.promedioActual!,
          creditos: m.clase.asignatura.creditos,
        })),
      ),
      generadoEn: new Date().toISOString(),
    };
  }

  // ===== Resumen de todas las clases (rector: todas | profesor: las suyas) =====
  async resumenClases(usuario: UsuarioSesion) {
    const clases = await this.clasesService.listar(usuario);
    return Promise.all(
      clases.map(async (resumenClase) => {
        const clase = await this.clasesService.buscar(resumenClase.id);
        const planilla =
          await this.calificacionesService.construirPlanilla(clase);
        return {
          clase: resumenClase,
          porcentajeEvaluado: planilla.porcentajeTotal,
          ...this.estadisticas(planilla.filas),
        };
      }),
    );
  }

  // Estadísticas de una clase a partir de las filas de la planilla
  private estadisticas(
    filas: {
      promedioActual: number | null;
      asistencia: number | null;
      estado: string;
    }[],
  ) {
    const promedios = filas.flatMap((f) =>
      f.promedioActual === null ? [] : [f.promedioActual],
    );
    const asistencias = filas.flatMap((f) =>
      f.asistencia === null ? [] : [f.asistencia],
    );
    return {
      estudiantes: filas.length,
      promedio: promedio(promedios),
      // "En riesgo" = con lo evaluado hasta ahora va perdiendo la materia
      enRiesgo: promedios.filter((p) => p < NOTA_APROBACION).length,
      aprobados: filas.filter((f) => f.estado === 'Aprobada').length,
      reprobados: filas.filter((f) => f.estado === 'Reprobada').length,
      asistenciaPromedio: asistencias.length
        ? Math.round(
            asistencias.reduce((a, b) => a + b, 0) / asistencias.length,
          )
        : null,
    };
  }

  // ===== Datos del panel de inicio, según el rol =====
  async panel(usuario: UsuarioSesion, hoy: string) {
    const clases = await this.clasesService.listar(usuario, periodoActual());
    const clasesHoy = clases.filter((c) => c.dia === hoy);

    if (usuario.rol === 'rector') {
      const [estudiantes, profesores] = await Promise.all([
        this.usuarios.countBy({ rol: 'estudiante', activo: true }),
        this.usuarios.countBy({ rol: 'profesor', activo: true }),
      ]);
      return {
        tarjetas: [
          { etiqueta: 'Estudiantes activos', valor: estudiantes },
          { etiqueta: 'Profesores', valor: profesores },
          { etiqueta: `Clases ${periodoActual()}`, valor: clases.length },
          {
            etiqueta: 'Matrículas',
            valor: clases.reduce((t, c) => t + c.inscritos, 0),
          },
        ],
        clasesHoy,
      };
    }

    if (usuario.rol === 'profesor') {
      return {
        tarjetas: [
          { etiqueta: 'Mis clases', valor: clases.length },
          {
            etiqueta: 'Mis estudiantes',
            valor: clases.reduce((t, c) => t + c.inscritos, 0),
          },
          { etiqueta: 'Clases hoy', valor: clasesHoy.length },
        ],
        clasesHoy,
      };
    }

    // Estudiante
    const boletin = await this.boletin(usuario.id, usuario);
    const asistencias = boletin.materias.flatMap((m) =>
      m.asistencia === null ? [] : [m.asistencia],
    );
    return {
      tarjetas: [
        { etiqueta: 'Materias inscritas', valor: boletin.materias.length },
        { etiqueta: 'Créditos', valor: boletin.creditos },
        {
          etiqueta: 'Promedio actual',
          valor: boletin.promedioPonderado ?? '—',
        },
        {
          etiqueta: 'Asistencia',
          valor: asistencias.length
            ? `${Math.round(asistencias.reduce((a, b) => a + b, 0) / asistencias.length)}%`
            : '—',
        },
      ],
      clasesHoy,
    };
  }
}
