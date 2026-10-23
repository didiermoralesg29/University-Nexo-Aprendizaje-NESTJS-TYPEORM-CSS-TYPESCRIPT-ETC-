import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto.js';
import { Roles } from '../auth/decoradores/roles.decorator.js';
import { ROLES, type Rol } from './usuario.entity.js';

// Todo este controlador es solo para el rector (@Roles a nivel de clase)
@Roles('rector')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // GET /api/usuarios?rol=estudiante&buscar=sofia
  @Get()
  listar(@Query('rol') rol?: string, @Query('buscar') buscar?: string) {
    const rolValido = ROLES.includes(rol as Rol) ? (rol as Rol) : undefined;
    return this.usuariosService.listar(rolValido, buscar);
  }

  // GET /api/usuarios/5
  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.buscar(id);
  }

  // POST /api/usuarios -> registrar estudiante o profesor
  @Post()
  crear(@Body() datos: CrearUsuarioDto) {
    return this.usuariosService.crear(datos);
  }

  // PATCH /api/usuarios/5 -> editar
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarUsuarioDto,
  ) {
    return this.usuariosService.actualizar(id, datos);
  }
}
