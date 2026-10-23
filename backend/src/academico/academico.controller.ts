import { Body, Controller, Get, Post } from '@nestjs/common';
import { AcademicoService } from './academico.service.js';
import { CrearProgramaDto } from './dto/crear-programa.dto.js';
import { CrearAsignaturaDto } from './dto/crear-asignatura.dto.js';
import { Roles } from '../auth/decoradores/roles.decorator.js';

@Controller()
export class AcademicoController {
  constructor(private readonly academicoService: AcademicoService) {}

  // GET /api/programas -> cualquier usuario con sesión
  @Get('programas')
  listarProgramas() {
    return this.academicoService.listarProgramas();
  }

  // POST /api/programas -> solo rector
  @Roles('rector')
  @Post('programas')
  crearPrograma(@Body() datos: CrearProgramaDto) {
    return this.academicoService.crearPrograma(datos);
  }

  // GET /api/asignaturas
  @Get('asignaturas')
  listarAsignaturas() {
    return this.academicoService.listarAsignaturas();
  }

  // POST /api/asignaturas -> solo rector
  @Roles('rector')
  @Post('asignaturas')
  crearAsignatura(@Body() datos: CrearAsignaturaDto) {
    return this.academicoService.crearAsignatura(datos);
  }
}
