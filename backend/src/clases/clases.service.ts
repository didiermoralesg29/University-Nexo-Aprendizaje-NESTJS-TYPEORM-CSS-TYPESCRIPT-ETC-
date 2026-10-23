import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Clase } from './clase.entity.js';
import { Inscripcion } from './inscripcion.entity.js';
import { Asignatura } from '../academico/asignatura.entity.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { CrearClaseDto } from './dto/crear-clase.dto.js';
import { ActualizarClaseDto } from './dto/actualizar-clase.dto.js';
import { periodoActual, seCruzan } from '../comun/horarios.js';
import type { UsuarioSesion } from '../auth/usuario-sesion.js';

// Orden del horario: por día (el enum de Postgres respeta el orden Lunes..Sábado) y hora
const ORDEN_HORARIO = { dia: 'ASC', horaInicio: 'ASC' } as const;

@Injectable()
export class ClasesService {
  constructor(
    @InjectRepository(Clase) private readonly clases: Repository<Clase>,
    @InjectRepository(Inscripcion)
    private readonly inscripciones: Repository<Inscripcion>,
    @InjectRepository(Asignatura)
    private readonly asignaturas: Repository<Asignatura>,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
  ) {}

  // ================= Consultar =================

  // Cada rol ve clases distintas:
  //  rector -> todas | profesor -> las que dicta | estudiante -> en las que está inscrito
  async listar(usuario: UsuarioSesion, periodo?: string) {
    let where: FindOptionsWhere<Clase> = periodo ? { periodo } : {};
    if (usuario.rol === 'profesor') {
      where = { ...where, profesor: { id: usuario.id } };
    }
    if (usuario.rol === 'estudiante') {
      where = { ...where, inscripciones: { estudiante: { id: usuario.id } } };
    }
    const clases = await this.clases.find({ where, order: ORDEN_HORARIO });
    return Promise.all(clases.map((clase) => this.resumir(clase)));
  }

  // Oferta del periodo actual para que el estudiante elija materias
  async oferta(estudianteId: number) {
    const clases = await this.clases.find({
      where: { periodo: periodoActual() },
      order: ORDEN_HORARIO,
    });
    const mias = await this.idsClasesDeEstudiante(estudianteId);
    return Promise.all(
      clases.map(async (clase) => ({
        ...(await this.resumir(clase)),
        inscrito: mias.has(clase.id),
      })),
    );
  }

  async detalle(id: number, usuario: UsuarioSesion) {
    const clase = await this.buscarParaVer(id, usuario);
    const resumen = await this.resumir(clase);
    const puedeGestionar = this.puedeGestionar(clase, usuario);

    // El estudiante ve la información de la clase, pero no la lista de compañeros
    if (!puedeGestionar) {
      return { ...resumen, puedeGestionar, estudiantes: [] };
    }

    const inscripciones = await this.inscripciones.find({
      where: { clase: { id } },
      order: { estudiante: { nombre: 'ASC' } },
    });
    return {
      ...resumen,
      puedeGestionar,
      estudiantes: inscripciones.map((i) => ({
        inscripcionId: i.id,
        id: i.estudiante.id,
        nombre: i.estudiante.nombre,
        codigo: i.estudiante.codigo,
        email: i.estudiante.email,
        programa: i.estudiante.programa?.nombre ?? null,
        semestre: i.estudiante.semestre,
      })),
    };
  }

  // ================= Crear / editar / eliminar =================

  async crear(datos: CrearClaseDto, usuario: UsuarioSesion) {
    // Un profesor solo puede crear clases para sí mismo
    const profesorId =
      usuario.rol === 'profesor' ? usuario.id : datos.profesorId;
    if (!profesorId) {
      throw new BadRequestException('Elige el profesor que dictará la clase');
    }

    const clase = this.clases.create({
      asignatura: await this.buscarAsignatura(datos.asignaturaId),
      profesor: await this.buscarProfesor(profesorId),
      periodo: datos.periodo ?? periodoActual(),
      grupo: datos.grupo ?? 'A',
      dia: datos.dia,
      horaInicio: datos.horaInicio,
      horaFin: datos.horaFin,
      salon: datos.salon,
      cupo: datos.cupo,
    });
    await this.validarHorario(clase);
    const guardada = await this.clases.save(clase);
    return this.resumir(guardada);
  }

  async actualizar(
    id: number,
    datos: ActualizarClaseDto,
    usuario: UsuarioSesion,
  ) {
    const clase = await this.buscarParaGestionar(id, usuario);

    if (
      datos.profesorId !== undefined &&
      datos.profesorId !== clase.profesor.id
    ) {
      if (usuario.rol !== 'rector') {
        throw new ForbiddenException(
          'Solo el rector puede cambiar el profesor',
        );
      }
      clase.profesor = await this.buscarProfesor(datos.profesorId);
    }
    if (datos.cupo !== undefined) {
      const inscritos = await this.contarInscritos(id);
      if (datos.cupo < inscritos) {
        throw new BadRequestException(
          `El cupo no puede ser menor a los ${inscritos} inscritos`,
        );
      }
      clase.cupo = datos.cupo;
    }
    if (datos.grupo !== undefined) clase.grupo = datos.grupo;
    if (datos.dia !== undefined) clase.dia = datos.dia;
    if (datos.horaInicio !== undefined) clase.horaInicio = datos.horaInicio;
    if (datos.horaFin !== undefined) clase.horaFin = datos.horaFin;
    if (datos.salon !== undefined) clase.salon = datos.salon;

    await this.validarHorario(clase);
    await this.clases.save(clase);
    return this.resumir(clase);
  }

  async eliminar(id: number, usuario: UsuarioSesion) {
    const clase = await this.buscarParaGestionar(id, usuario);
    // Gracias a onDelete: 'CASCADE', se borran también sus inscripciones, notas, etc.
    await this.clases.remove(clase);
  }

  // ================= Inscripciones =================

  async inscribir(claseId: number, estudianteId: number) {
    const clase = await this.buscar(claseId);

    const estudiante = await this.usuarios.findOneBy({
      id: estudianteId,
      rol: 'estudiante',
    });
    if (!estudiante) {
      throw new BadRequestException(`No existe el estudiante ${estudianteId}`);
    }
    if (!estudiante.activo) {
      throw new BadRequestException(`${estudiante.nombre} está inactivo`);
    }

    const yaInscrito = await this.inscripciones.existsBy({
      clase: { id: claseId },
      estudiante: { id: estudianteId },
    });
    if (yaInscrito) {
      throw new ConflictException(
        'El estudiante ya está inscrito en esta clase',
      );
    }
    if ((await this.contarInscritos(claseId)) >= clase.cupo) {
      throw new ConflictException('La clase no tiene cupos disponibles');
    }

    // Regla universitaria: no puedes inscribir dos materias a la misma hora
    const otras = await this.inscripciones.find({
      where: {
        estudiante: { id: estudianteId },
        clase: { periodo: clase.periodo },
      },
      relations: { clase: true },
    });
    const cruce = otras.find((i) => seCruzan(i.clase, clase));
    if (cruce) {
      const c = cruce.clase;
      throw new ConflictException(
        `Se cruza con ${c.asignatura.nombre} (${c.dia} ${c.horaInicio}-${c.horaFin})`,
      );
    }

    await this.inscripciones.save(
      this.inscripciones.create({ clase, estudiante }),
    );
    return this.resumir(clase);
  }

  async cancelarInscripcion(claseId: number, estudianteId: number) {
    const inscripcion = await this.inscripciones.findOneBy({
      clase: { id: claseId },
      estudiante: { id: estudianteId },
    });
    if (!inscripcion) {
      throw new NotFoundException(
        'El estudiante no está inscrito en esta clase',
      );
    }
    await this.inscripciones.remove(inscripcion);
  }

  // ================= Permisos (los usan también otros módulos) =================

  async buscar(id: number) {
    const clase = await this.clases.findOneBy({ id });
    if (!clase) {
      throw new NotFoundException(`No existe la clase ${id}`);
    }
    return clase;
  }

  // Gestionar = tomar asistencia, poner notas, subir material, editar la clase
  puedeGestionar(clase: Clase, usuario: UsuarioSesion) {
    return (
      usuario.rol === 'rector' ||
      (usuario.rol === 'profesor' && clase.profesor.id === usuario.id)
    );
  }

  async buscarParaGestionar(id: number, usuario: UsuarioSesion) {
    const clase = await this.buscar(id);
    if (!this.puedeGestionar(clase, usuario)) {
      throw new ForbiddenException(
        'Solo el profesor de esta clase o el rector pueden hacer esto',
      );
    }
    return clase;
  }

  // Ver = gestionar, o ser estudiante inscrito
  async buscarParaVer(id: number, usuario: UsuarioSesion) {
    const clase = await this.buscar(id);
    if (this.puedeGestionar(clase, usuario)) return clase;
    if (usuario.rol === 'estudiante') {
      const inscrito = await this.inscripciones.existsBy({
        clase: { id },
        estudiante: { id: usuario.id },
      });
      if (inscrito) return clase;
    }
    throw new ForbiddenException('No tienes acceso a esta clase');
  }

  // Datos de una clase listos para enviar al frontend (lo usan también los reportes)
  async resumir(clase: Clase) {
    return {
      id: clase.id,
      asignatura: {
        id: clase.asignatura.id,
        codigo: clase.asignatura.codigo,
        nombre: clase.asignatura.nombre,
        creditos: clase.asignatura.creditos,
      },
      profesor: { id: clase.profesor.id, nombre: clase.profesor.nombre },
      periodo: clase.periodo,
      grupo: clase.grupo,
      dia: clase.dia,
      horaInicio: clase.horaInicio,
      horaFin: clase.horaFin,
      salon: clase.salon,
      cupo: clase.cupo,
      inscritos: await this.contarInscritos(clase.id),
    };
  }

  // ================= Ayudantes privados =================

  private contarInscritos(claseId: number) {
    return this.inscripciones.countBy({ clase: { id: claseId } });
  }

  private async idsClasesDeEstudiante(estudianteId: number) {
    const inscripciones = await this.inscripciones.find({
      where: { estudiante: { id: estudianteId } },
      relations: { clase: true },
    });
    return new Set(inscripciones.map((i) => i.clase.id));
  }

  private async buscarAsignatura(id: number) {
    const asignatura = await this.asignaturas.findOneBy({ id });
    if (!asignatura) {
      throw new BadRequestException(`No existe la asignatura ${id}`);
    }
    return asignatura;
  }

  private async buscarProfesor(id: number) {
    const profesor = await this.usuarios.findOneBy({ id, rol: 'profesor' });
    if (!profesor) {
      throw new BadRequestException(`No existe el profesor ${id}`);
    }
    return profesor;
  }

  // La hora de fin debe ser posterior y el profesor no puede tener otra clase a esa hora
  private async validarHorario(clase: Clase) {
    if (clase.horaFin <= clase.horaInicio) {
      throw new BadRequestException(
        'La hora de fin debe ser después de la de inicio',
      );
    }
    const delProfesor = await this.clases.find({
      where: { profesor: { id: clase.profesor.id }, periodo: clase.periodo },
    });
    const cruce = delProfesor.find(
      (otra) => otra.id !== clase.id && seCruzan(otra, clase),
    );
    if (cruce) {
      throw new ConflictException(
        `${clase.profesor.nombre} ya dicta ${cruce.asignatura.nombre} ` +
          `el ${cruce.dia} de ${cruce.horaInicio} a ${cruce.horaFin}`,
      );
    }
  }
}
