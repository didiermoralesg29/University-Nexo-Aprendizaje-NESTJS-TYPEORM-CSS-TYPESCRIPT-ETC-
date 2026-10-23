import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Programa } from './programa.entity.js';
import { Asignatura } from './asignatura.entity.js';
import { CrearProgramaDto } from './dto/crear-programa.dto.js';
import { CrearAsignaturaDto } from './dto/crear-asignatura.dto.js';

@Injectable()
export class AcademicoService {
  constructor(
    @InjectRepository(Programa)
    private readonly programas: Repository<Programa>,
    @InjectRepository(Asignatura)
    private readonly asignaturas: Repository<Asignatura>,
  ) {}

  listarProgramas() {
    return this.programas.find({ order: { nombre: 'ASC' } });
  }

  async crearPrograma(datos: CrearProgramaDto) {
    if (await this.programas.existsBy({ nombre: datos.nombre })) {
      throw new ConflictException(`Ya existe el programa ${datos.nombre}`);
    }
    return this.programas.save(this.programas.create(datos));
  }

  listarAsignaturas() {
    return this.asignaturas.find({ order: { codigo: 'ASC' } });
  }

  async crearAsignatura(datos: CrearAsignaturaDto) {
    const codigo = datos.codigo.toUpperCase();
    if (await this.asignaturas.existsBy({ codigo })) {
      throw new ConflictException(
        `Ya existe una asignatura con el código ${codigo}`,
      );
    }

    let programa: Programa | null = null;
    if (datos.programaId) {
      programa = await this.programas.findOneBy({ id: datos.programaId });
      if (!programa) {
        throw new BadRequestException(
          `No existe el programa ${datos.programaId}`,
        );
      }
    }

    return this.asignaturas.save(
      this.asignaturas.create({
        codigo,
        nombre: datos.nombre,
        creditos: datos.creditos,
        programa,
      }),
    );
  }
}
