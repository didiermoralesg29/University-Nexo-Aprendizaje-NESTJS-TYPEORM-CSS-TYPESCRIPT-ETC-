import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ReportesService } from './reportes.service.js';
import { Roles } from '../auth/decoradores/roles.decorator.js';
import { UsuarioActual } from '../auth/decoradores/usuario-actual.decorator.js';
import type { UsuarioSesion } from '../auth/usuario-sesion.js';
import { nombreDia } from '../comun/horarios.js';

@Controller()
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  // GET /api/panel -> tarjetas y clases de hoy, según el rol
  @Get('panel')
  panel(@UsuarioActual() usuario: UsuarioSesion) {
    return this.reportesService.panel(usuario, nombreDia(new Date()));
  }

  // GET /api/reportes/clases -> resumen de todas las clases
  @Roles('profesor', 'rector')
  @Get('reportes/clases')
  resumenClases(@UsuarioActual() usuario: UsuarioSesion) {
    return this.reportesService.resumenClases(usuario);
  }

  // GET /api/reportes/clases/3 -> reporte de notas de una clase
  @Roles('profesor', 'rector')
  @Get('reportes/clases/:id')
  reporteClase(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioSesion,
  ) {
    return this.reportesService.reporteClase(id, usuario);
  }

  // GET /api/reportes/estudiantes/12 -> boletín de notas
  @Roles('estudiante', 'rector')
  @Get('reportes/estudiantes/:id')
  boletin(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioSesion,
  ) {
    return this.reportesService.boletin(id, usuario);
  }
}
