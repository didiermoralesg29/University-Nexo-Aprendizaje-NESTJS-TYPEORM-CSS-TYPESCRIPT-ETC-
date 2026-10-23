import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asistencia } from './asistencia.entity.js';
import { Inscripcion } from '../clases/inscripcion.entity.js';
import { ClasesService } from '../clases/clases.service.js';
import { GuardarAsistenciaDto } from './dto/guardar-asistencia.dto.js';
import { porcentaje } from '../comun/calculos.js';
import { fechaISO } from '../comun/horarios.js';
import type { UsuarioSesion } from '../auth/usuario-sesion.js';

@Injectable()
export class AsistenciaService {
  constructor(
    @InjectRepository(Asistencia)
    private readonly asistencias: Repository<Asistencia>,
    @InjectRepository(Inscripcion)
    private readonly inscripciones: Repository<Inscripcion>,
    private readonly clasesService: ClasesService,
  ) {}

  // La lista para tomar asistencia en una fecha + el historial de la clase
  async consultar(claseId: number, fecha: string, usuario: UsuarioSesion) {
    await this.clasesService.buscarParaGestionar(claseId, usuario);
    this.validarFecha(fecha);

    const inscripciones = await this.inscripciones.find({
      where: { clase: { id: claseId } },
      order: { estudiante: { nombre: 'ASC' } },
    });
    const registros = await this.asistencias.find({
      where: { inscripcion: { clase: { id: claseId } } },
      relations: { inscripcion: true },
    });

    const delDia = registros.filter((r) => r.fecha === fecha);
    const registrada = delDia.length > 0;

    // Agrupamos el historial por fecha: '2026-10-20' -> [registros de ese día]
    const porFecha = new Map<string, Asistencia[]>();
    for (const registro of registros) {
      porFecha.set(registro.fecha, [
        ...(porFecha.get(registro.fecha) ?? []),
        registro,
      ]);
    }
    const historial = [...porFecha.entries()]
      .map(([dia, lista]) => {
        const presentes = lista.filter((r) => r.presente).length;
        return {
          fecha: dia,
          presentes,
          total: lista.length,
          porcentaje: porcentaje(presentes, lista.length),
        };
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha)); // más reciente primero

    return {
      fecha,
      registrada,
      estudiantes: inscripciones.map((i) => ({
        inscripcionId: i.id,
        estudiante: {
          id: i.estudiante.id,
          nombre: i.estudiante.nombre,
          codigo: i.estudiante.codigo,
        },
        // Fecha nueva -> todos presentes por defecto; si ya existe, lo guardado
        presente: registrada
          ? (delDia.find((r) => r.inscripcion.id === i.id)?.presente ?? false)
          : true,
      })),
      historial,
    };
  }

  async guardar(
    claseId: number,
    datos: GuardarAsistenciaDto,
    usuario: UsuarioSesion,
  ) {
    await this.clasesService.buscarParaGestionar(claseId, usuario);
    this.validarFecha(datos.fecha);

    const inscripciones = await this.inscripciones.find({
      where: { clase: { id: claseId } },
    });
    for (const inscripcion of inscripciones) {
      const presente = datos.presentes.includes(inscripcion.id);
      const existente = await this.asistencias.findOneBy({
        inscripcion: { id: inscripcion.id },
        fecha: datos.fecha,
      });
      if (existente) {
        existente.presente = presente;
        await this.asistencias.save(existente);
      } else {
        await this.asistencias.save(
          this.asistencias.create({
            inscripcion,
            fecha: datos.fecha,
            presente,
          }),
        );
      }
    }
    return this.consultar(claseId, datos.fecha, usuario);
  }

  private validarFecha(fecha: string) {
    if (isNaN(new Date(fecha).getTime())) {
      throw new BadRequestException(`Fecha no válida: ${fecha}`);
    }
    if (fecha > fechaISO(new Date())) {
      throw new BadRequestException(
        'No puedes registrar asistencia de una fecha futura',
      );
    }
  }
}
