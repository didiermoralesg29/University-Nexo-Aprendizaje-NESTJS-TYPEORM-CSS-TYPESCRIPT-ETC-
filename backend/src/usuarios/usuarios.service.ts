import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { Usuario, type Rol } from './usuario.entity.js';
import { Programa } from '../academico/programa.entity.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto.js';

@Injectable()
export class UsuariosService {
  // @InjectRepository nos da un "repositorio": el objeto para consultar una tabla
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Programa)
    private readonly programas: Repository<Programa>,
  ) {}

  // Lista usuarios, opcionalmente filtrando por rol y buscando por nombre, correo o código
  listar(rol?: Rol, buscar?: string) {
    const porRol = rol ? { rol } : {};
    const where = buscar
      ? [
          { ...porRol, nombre: ILike(`%${buscar}%`) },
          { ...porRol, email: ILike(`%${buscar}%`) },
          { ...porRol, codigo: ILike(`%${buscar}%`) },
        ]
      : porRol;
    return this.usuarios.find({ where, order: { nombre: 'ASC' } });
  }

  async buscar(id: number) {
    const usuario = await this.usuarios.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`No existe el usuario ${id}`);
    }
    return usuario;
  }

  // Única consulta que trae la contraseña (la necesita el login)
  buscarConContrasena(email: string) {
    return this.usuarios
      .createQueryBuilder('usuario')
      .addSelect('usuario.contrasena')
      .where('LOWER(usuario.email) = LOWER(:email)', { email })
      .getOne();
  }

  async crear(datos: CrearUsuarioDto) {
    const esEstudiante = datos.rol === 'estudiante';
    if (esEstudiante && !datos.programaId) {
      throw new BadRequestException(
        'El estudiante debe pertenecer a un programa',
      );
    }
    await this.verificarEmailLibre(datos.email);
    if (datos.codigo) await this.verificarCodigoLibre(datos.codigo);

    const usuario = this.usuarios.create({
      nombre: datos.nombre,
      email: datos.email.toLowerCase(),
      // Nunca guardamos la contraseña real: bcrypt genera un "hash" irreversible
      contrasena: await bcrypt.hash(datos.contrasena, 10),
      rol: datos.rol,
      documento: datos.documento ?? null,
      telefono: datos.telefono ?? null,
      codigo: esEstudiante ? (datos.codigo ?? null) : null,
      programa: esEstudiante
        ? await this.buscarPrograma(datos.programaId!)
        : null,
      semestre: esEstudiante ? (datos.semestre ?? 1) : null,
      departamento:
        datos.rol === 'profesor' ? (datos.departamento ?? null) : null,
    });
    const guardado = await this.usuarios.save(usuario);

    // Código estudiantil automático: año + id con 4 cifras. Ej: 20260015
    if (esEstudiante && !guardado.codigo) {
      guardado.codigo = `${new Date().getFullYear()}${String(guardado.id).padStart(4, '0')}`;
      await this.usuarios.save(guardado);
    }
    return this.buscar(guardado.id);
  }

  async actualizar(id: number, datos: ActualizarUsuarioDto) {
    const usuario = await this.buscar(id);

    if (datos.email && datos.email.toLowerCase() !== usuario.email) {
      await this.verificarEmailLibre(datos.email);
      usuario.email = datos.email.toLowerCase();
    }
    if (datos.codigo && datos.codigo !== usuario.codigo) {
      await this.verificarCodigoLibre(datos.codigo);
      usuario.codigo = datos.codigo;
    }
    if (datos.programaId !== undefined) {
      usuario.programa = await this.buscarPrograma(datos.programaId);
    }
    if (datos.contrasena) {
      usuario.contrasena = await bcrypt.hash(datos.contrasena, 10);
    }
    // El resto de campos se copian solo si vienen en la petición
    if (datos.nombre !== undefined) usuario.nombre = datos.nombre;
    if (datos.documento !== undefined) usuario.documento = datos.documento;
    if (datos.telefono !== undefined) usuario.telefono = datos.telefono;
    if (datos.semestre !== undefined) usuario.semestre = datos.semestre;
    if (datos.departamento !== undefined)
      usuario.departamento = datos.departamento;
    if (datos.activo !== undefined) usuario.activo = datos.activo;

    await this.usuarios.save(usuario);
    return this.buscar(id);
  }

  private async buscarPrograma(id: number) {
    const programa = await this.programas.findOneBy({ id });
    if (!programa) {
      throw new BadRequestException(`No existe el programa ${id}`);
    }
    return programa;
  }

  private async verificarEmailLibre(email: string) {
    const existe = await this.usuarios.existsBy({ email: email.toLowerCase() });
    if (existe) {
      throw new ConflictException(
        `Ya existe un usuario con el correo ${email}`,
      );
    }
  }

  private async verificarCodigoLibre(codigo: string) {
    if (await this.usuarios.existsBy({ codigo })) {
      throw new ConflictException(
        `Ya existe un estudiante con el código ${codigo}`,
      );
    }
  }
}
