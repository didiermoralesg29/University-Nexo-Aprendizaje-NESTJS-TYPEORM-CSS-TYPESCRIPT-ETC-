import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClasesService } from './clases.service.js';
import { CrearClaseDto } from './dto/crear-clase.dto.js';
import { ActualizarClaseDto } from './dto/actualizar-clase.dto.js';
import { InscribirDto } from './dto/inscribir.dto.js';
import { Roles } from '../auth/decoradores/roles.decorator.js';
import { UsuarioActual } from '../auth/decoradores/usuario-actual.decorator.js';
import type { UsuarioSesion } from '../auth/usuario-sesion.js';

@Controller('clases')
export class ClasesController {
  constructor(private readonly clasesService: ClasesService) {}

  // GET /api/clases?periodo=2026-2 -> las clases que le corresponden a cada rol
  @Get()
  listar(
    @UsuarioActual() usuario: UsuarioSesion,
    @Query('periodo') periodo?: string,
  ) {
    return this.clasesService.listar(usuario, periodo);
  }

  // GET /api/clases/oferta -> clases disponibles para inscribir.
  // ⚠️ Va ANTES de ':id'; si no, Nest pensaría que 'oferta' es un id.
  @Roles('estudiante')
  @Get('oferta')
  oferta(@UsuarioActual() usuario: UsuarioSesion) {
    return this.clasesService.oferta(usuario.id);
  }

  // GET /api/clases/3
  @Get(':id')
  detalle(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioSesion,
  ) {
    return this.clasesService.detalle(id, usuario);
  }

  // POST /api/clases -> crear una clase
  @Roles('profesor', 'rector')
  @Post()
  crear(@Body() datos: CrearClaseDto, @UsuarioActual() usuario: UsuarioSesion) {
    return this.clasesService.crear(datos, usuario);
  }

  // PATCH /api/clases/3 -> editar
  @Roles('profesor', 'rector')
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarClaseDto,
    @UsuarioActual() usuario: UsuarioSesion,
  ) {
    return this.clasesService.actualizar(id, datos, usuario);
  }

  // DELETE /api/clases/3 -> 204 "sin contenido" cuando sale bien
  @Roles('profesor', 'rector')
  @Delete(':id')
  @HttpCode(204)
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioSesion,
  ) {
    return this.clasesService.eliminar(id, usuario);
  }

  // POST /api/clases/3/inscripciones
  //  estudiante: se inscribe a sí mismo | rector: { estudianteId }
  @Roles('estudiante', 'rector')
  @Post(':id/inscripciones')
  inscribir(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: InscribirDto,
    @UsuarioActual() usuario: UsuarioSesion,
  ) {
    const estudianteId =
      usuario.rol === 'estudiante' ? usuario.id : datos.estudianteId;
    if (!estudianteId) {
      throw new BadRequestException('Elige el estudiante a inscribir');
    }
    return this.clasesService.inscribir(id, estudianteId);
  }

  // DELETE /api/clases/3/inscripciones/12 -> cancelar la materia
  @Roles('estudiante', 'rector')
  @Delete(':id/inscripciones/:estudianteId')
  @HttpCode(204)
  cancelarInscripcion(
    @Param('id', ParseIntPipe) id: number,
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @UsuarioActual() usuario: UsuarioSesion,
  ) {
    if (usuario.rol === 'estudiante' && usuario.id !== estudianteId) {
      throw new ForbiddenException('Solo puedes cancelar tus propias materias');
    }
    return this.clasesService.cancelarInscripcion(id, estudianteId);
  }
}
