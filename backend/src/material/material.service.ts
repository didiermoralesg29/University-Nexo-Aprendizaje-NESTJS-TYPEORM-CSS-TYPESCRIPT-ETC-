import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Material } from './material.entity.js';
import { Clase } from '../clases/clase.entity.js';
import { ClasesService } from '../clases/clases.service.js';
import { CrearMaterialDto } from './dto/crear-material.dto.js';
import type { UsuarioSesion } from '../auth/usuario-sesion.js';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materiales: Repository<Material>,
    private readonly clasesService: ClasesService,
  ) {}

  // Cada rol ve el material de "sus" clases (el rector ve todo)
  async listar(usuario: UsuarioSesion, claseId?: number) {
    // Armamos el filtro sobre la clase del material paso a paso
    const filtroClase: FindOptionsWhere<Clase> = {};
    if (claseId) filtroClase.id = claseId;
    if (usuario.rol === 'profesor') filtroClase.profesor = { id: usuario.id };
    if (usuario.rol === 'estudiante') {
      filtroClase.inscripciones = { estudiante: { id: usuario.id } };
    }
    const materiales = await this.materiales.find({
      where: { clase: filtroClase },
      order: { creadoEn: 'DESC' },
    });
    return materiales.map((m) => this.resumir(m, usuario));
  }

  async crear(
    claseId: number,
    datos: CrearMaterialDto,
    usuario: UsuarioSesion,
  ) {
    const clase = await this.clasesService.buscarParaGestionar(
      claseId,
      usuario,
    );
    const material = await this.materiales.save(
      this.materiales.create({
        titulo: datos.titulo,
        descripcion: datos.descripcion ?? '',
        tipo: datos.tipo,
        enlace: datos.enlace,
        clase,
      }),
    );
    return this.resumir(material, usuario);
  }

  async eliminar(id: number, usuario: UsuarioSesion) {
    const material = await this.materiales.findOneBy({ id });
    if (!material) {
      throw new NotFoundException(`No existe el material ${id}`);
    }
    await this.clasesService.buscarParaGestionar(material.clase.id, usuario);
    await this.materiales.remove(material);
  }

  private resumir(material: Material, usuario: UsuarioSesion) {
    const clase = material.clase;
    return {
      id: material.id,
      titulo: material.titulo,
      descripcion: material.descripcion,
      tipo: material.tipo,
      enlace: material.enlace,
      creadoEn: material.creadoEn,
      clase: {
        id: clase.id,
        asignatura: clase.asignatura.nombre,
        grupo: clase.grupo,
        profesor: clase.profesor.nombre,
      },
      puedeEliminar: this.clasesService.puedeGestionar(clase, usuario),
    };
  }
}
