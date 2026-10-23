import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluacion } from './evaluacion.entity.js';
import { Nota } from './nota.entity.js';
import { Inscripcion } from '../clases/inscripcion.entity.js';
import { Clase } from '../clases/clase.entity.js';
import { ClasesService } from '../clases/clases.service.js';
import {
  ActualizarEvaluacionDto,
  CrearEvaluacionDto,
} from './dto/evaluacion.dto.js';
import { GuardarNotasDto } from './dto/guardar-notas.dto.js';
import {
  calcularDefinitiva,
  estadoMateria,
  porcentajeAsistencia,
} from '../comun/calculos.js';
import type { UsuarioSesion } from '../auth/usuario-sesion.js';

@Injectable()
export class CalificacionesService {
  constructor(
    @InjectRepository(Evaluacion)
    private readonly evaluaciones: Repository<Evaluacion>,
    @InjectRepository(Nota) private readonly notas: Repository<Nota>,
    @InjectRepository(Inscripcion)
    private readonly inscripciones: Repository<Inscripcion>,
    private readonly clasesService: ClasesService,
  ) {}

  // ================= Planilla de notas =================

  async planilla(claseId: number, usuario: UsuarioSesion) {
    const clase = await this.clasesService.buscarParaGestionar(
      claseId,
      usuario,
    );
    return this.construirPlanilla(clase);
  }

  // Tabla completa: una fila por estudiante y una columna por evaluación.
  // La usan también los reportes.
  async construirPlanilla(clase: Clase) {
    const evaluaciones = await this.evaluacionesDeClase(clase.id);
    const inscripciones = await this.inscripciones.find({
      where: { clase: { id: clase.id } },
      relations: { notas: true, asistencias: true },
      order: { estudiante: { nombre: 'ASC' } },
    });

    return {
      evaluaciones: evaluaciones.map((e) => ({
        id: e.id,
        nombre: e.nombre,
        porcentaje: e.porcentaje,
      })),
      porcentajeTotal: evaluaciones.reduce(
        (total, e) => total + e.porcentaje,
        0,
      ),
      filas: inscripciones.map((inscripcion) => ({
        inscripcionId: inscripcion.id,
        estudiante: {
          id: inscripcion.estudiante.id,
          nombre: inscripcion.estudiante.nombre,
          codigo: inscripcion.estudiante.codigo,
        },
        ...this.resumirInscripcion(inscripcion, evaluaciones),
      })),
    };
  }

  // Notas, definitiva, estado y asistencia de UN estudiante en UNA clase
  resumirInscripcion(inscripcion: Inscripcion, evaluaciones: Evaluacion[]) {
    // valores[i] es la nota en evaluaciones[i] (null si aún no tiene)
    const valores = evaluaciones.map(
      (e) =>
        inscripcion.notas.find((n) => n.evaluacion.id === e.id)?.valor ?? null,
    );
    const { definitiva, promedioActual, porcentajeEvaluado } =
      calcularDefinitiva(
        evaluaciones.map((e, i) => ({
          porcentaje: e.porcentaje,
          valor: valores[i],
        })),
      );
    const asistencia = porcentajeAsistencia(inscripcion.asistencias);
    return {
      valores,
      definitiva,
      promedioActual,
      porcentajeEvaluado,
      estado: estadoMateria(definitiva, porcentajeEvaluado, asistencia),
      asistencia,
    };
  }

  evaluacionesDeClase(claseId: number) {
    return this.evaluaciones.find({
      where: { clase: { id: claseId } },
      order: { id: 'ASC' },
    });
  }

  // ================= Evaluaciones (columnas) =================

  async crearEvaluacion(
    claseId: number,
    datos: CrearEvaluacionDto,
    usuario: UsuarioSesion,
  ) {
    const clase = await this.clasesService.buscarParaGestionar(
      claseId,
      usuario,
    );
    await this.validarPorcentajeTotal(claseId, datos.porcentaje);
    await this.evaluaciones.save(
      this.evaluaciones.create({
        nombre: datos.nombre,
        porcentaje: datos.porcentaje,
        clase,
      }),
    );
    return this.construirPlanilla(clase);
  }

  async actualizarEvaluacion(
    id: number,
    datos: ActualizarEvaluacionDto,
    usuario: UsuarioSesion,
  ) {
    const evaluacion = await this.buscarEvaluacion(id);
    const clase = await this.clasesService.buscarParaGestionar(
      evaluacion.clase.id,
      usuario,
    );
    if (datos.porcentaje !== undefined) {
      await this.validarPorcentajeTotal(clase.id, datos.porcentaje, id);
      evaluacion.porcentaje = datos.porcentaje;
    }
    if (datos.nombre !== undefined) evaluacion.nombre = datos.nombre;
    await this.evaluaciones.save(evaluacion);
    return this.construirPlanilla(clase);
  }

  async eliminarEvaluacion(id: number, usuario: UsuarioSesion) {
    const evaluacion = await this.buscarEvaluacion(id);
    const clase = await this.clasesService.buscarParaGestionar(
      evaluacion.clase.id,
      usuario,
    );
    await this.evaluaciones.remove(evaluacion); // sus notas se borran en cascada
    return this.construirPlanilla(clase);
  }

  // ================= Notas (celdas) =================

  async guardarNotas(
    claseId: number,
    datos: GuardarNotasDto,
    usuario: UsuarioSesion,
  ) {
    const clase = await this.clasesService.buscarParaGestionar(
      claseId,
      usuario,
    );

    // Nunca confiamos en los ids que llegan: deben ser de ESTA clase
    const evaluaciones = await this.evaluacionesDeClase(claseId);
    const inscripciones = await this.inscripciones.find({
      where: { clase: { id: claseId } },
    });
    const idsEvaluaciones = new Set(evaluaciones.map((e) => e.id));
    const idsInscripciones = new Set(inscripciones.map((i) => i.id));

    for (const celda of datos.notas) {
      if (
        !idsEvaluaciones.has(celda.evaluacionId) ||
        !idsInscripciones.has(celda.inscripcionId)
      ) {
        throw new BadRequestException(
          'Hay notas que no pertenecen a esta clase',
        );
      }
    }

    for (const celda of datos.notas) {
      const existente = await this.notas.findOneBy({
        evaluacion: { id: celda.evaluacionId },
        inscripcion: { id: celda.inscripcionId },
      });
      if (celda.valor === null) {
        if (existente) await this.notas.remove(existente);
      } else if (existente) {
        existente.valor = celda.valor;
        await this.notas.save(existente);
      } else {
        await this.notas.save(
          this.notas.create({
            evaluacion: { id: celda.evaluacionId },
            inscripcion: { id: celda.inscripcionId },
            valor: celda.valor,
          }),
        );
      }
    }
    return this.construirPlanilla(clase);
  }

  // ================= Ayudantes =================

  private async buscarEvaluacion(id: number) {
    const evaluacion = await this.evaluaciones.findOne({
      where: { id },
      relations: { clase: true },
    });
    if (!evaluacion) {
      throw new NotFoundException(`No existe la evaluación ${id}`);
    }
    return evaluacion;
  }

  // Los porcentajes de una clase no pueden sumar más de 100
  private async validarPorcentajeTotal(
    claseId: number,
    nuevo: number,
    excluirId?: number,
  ) {
    const actuales = await this.evaluacionesDeClase(claseId);
    const usado = actuales
      .filter((e) => e.id !== excluirId)
      .reduce((total, e) => total + e.porcentaje, 0);
    if (usado + nuevo > 100) {
      throw new BadRequestException(
        `Los porcentajes sumarían ${usado + nuevo}%. Solo quedan ${100 - usado}% disponibles`,
      );
    }
  }
}
