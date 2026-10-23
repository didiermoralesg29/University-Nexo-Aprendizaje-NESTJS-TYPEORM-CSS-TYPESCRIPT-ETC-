import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import { AsistenciaService } from './asistencia.service.js';
import { GuardarAsistenciaDto } from './dto/guardar-asistencia.dto.js';
import { Roles } from '../auth/decoradores/roles.decorator.js';
import { UsuarioActual } from '../auth/decoradores/usuario-actual.decorator.js';
import type { UsuarioSesion } from '../auth/usuario-sesion.js';
import { fechaISO } from '../comun/horarios.js';

@Roles('profesor', 'rector')
@Controller('clases/:id/asistencia')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  // GET /api/clases/3/asistencia?fecha=2026-10-22  (sin fecha = hoy)
  @Get()
  consultar(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioSesion,
    @Query('fecha') fecha?: string,
  ) {
    return this.asistenciaService.consultar(
      id,
      fecha || fechaISO(new Date()),
      usuario,
    );
  }

  // PUT /api/clases/3/asistencia  { fecha, presentes: [ids de inscripción] }
  @Put()
  guardar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: GuardarAsistenciaDto,
    @UsuarioActual() usuario: UsuarioSesion,
  ) {
    return this.asistenciaService.guardar(id, datos, usuario);
  }
}
