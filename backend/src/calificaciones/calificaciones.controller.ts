import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CalificacionesService } from './calificaciones.service.js';
import {
  ActualizarEvaluacionDto,
  CrearEvaluacionDto,
} from './dto/evaluacion.dto.js';
import { GuardarNotasDto } from './dto/guardar-notas.dto.js';
import { Roles } from '../auth/decoradores/roles.decorator.js';
import { UsuarioActual } from '../auth/decoradores/usuario-actual.decorator.js';
import type { UsuarioSesion } from '../auth/usuario-sesion.js';

// Poner notas: solo el profesor de la clase o el rector
@Roles('profesor', 'rector')
@Controller()
export class CalificacionesController {
  constructor(private readonly calificacionesService: CalificacionesService) {}

  // GET /api/clases/3/notas -> la planilla completa
  @Get('clases/:id/notas')
  planilla(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioSesion,
  ) {
    return this.calificacionesService.planilla(id, usuario);
  }

  // PUT /api/clases/3/notas -> guardar varias notas a la vez
  @Put('clases/:id/notas')
  guardarNotas(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: GuardarNotasDto,
    @UsuarioActual() usuario: UsuarioSesion,
  ) {
    return this.calificacionesService.guardarNotas(id, datos, usuario);
  }

  // POST /api/clases/3/evaluaciones -> nueva columna (ej: "Parcial 1", 30%)
  @Post('clases/:id/evaluaciones')
  crearEvaluacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: CrearEvaluacionDto,
    @UsuarioActual() usuario: UsuarioSesion,
  ) {
    return this.calificacionesService.crearEvaluacion(id, datos, usuario);
  }

  // PATCH /api/evaluaciones/7
  @Patch('evaluaciones/:id')
  actualizarEvaluacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarEvaluacionDto,
    @UsuarioActual() usuario: UsuarioSesion,
  ) {
    return this.calificacionesService.actualizarEvaluacion(id, datos, usuario);
  }

  // DELETE /api/evaluaciones/7
  @Delete('evaluaciones/:id')
  eliminarEvaluacion(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioSesion,
  ) {
    return this.calificacionesService.eliminarEvaluacion(id, usuario);
  }
}
