import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { MaterialService } from './material.service.js';
import { CrearMaterialDto } from './dto/crear-material.dto.js';
import { Roles } from '../auth/decoradores/roles.decorator.js';
import { UsuarioActual } from '../auth/decoradores/usuario-actual.decorator.js';
import type { UsuarioSesion } from '../auth/usuario-sesion.js';

@Controller()
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  // GET /api/material?claseId=3 -> todos los roles (cada uno ve lo suyo)
  @Get('material')
  listar(
    @UsuarioActual() usuario: UsuarioSesion,
    @Query('claseId') claseId?: string,
  ) {
    return this.materialService.listar(
      usuario,
      claseId ? Number(claseId) : undefined,
    );
  }

  // POST /api/clases/3/material -> subir material a una clase
  @Roles('profesor', 'rector')
  @Post('clases/:id/material')
  crear(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: CrearMaterialDto,
    @UsuarioActual() usuario: UsuarioSesion,
  ) {
    return this.materialService.crear(id, datos, usuario);
  }

  // DELETE /api/material/9
  @Roles('profesor', 'rector')
  @Delete('material/:id')
  @HttpCode(204)
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioSesion,
  ) {
    return this.materialService.eliminar(id, usuario);
  }
}
