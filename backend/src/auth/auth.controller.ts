import { Body, Controller, Get, HttpCode, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { LoginDto } from './dto/login.dto.js';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto.js';
import { Publico } from './decoradores/publico.decorator.js';
import { UsuarioActual } from './decoradores/usuario-actual.decorator.js';
import type { UsuarioSesion } from './usuario-sesion.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService,
  ) {}

  // POST /api/auth/login  { email, contrasena }  -> { token, usuario }
  @Publico()
  @Post('login')
  @HttpCode(200)
  login(@Body() datos: LoginDto) {
    return this.authService.login(datos.email, datos.contrasena);
  }

  // GET /api/auth/perfil -> los datos del usuario que inició sesión
  @Get('perfil')
  perfil(@UsuarioActual() usuario: UsuarioSesion) {
    return this.usuariosService.buscar(usuario.id);
  }

  // PATCH /api/auth/perfil -> cambiar mi teléfono o mi contraseña
  @Patch('perfil')
  actualizarPerfil(
    @UsuarioActual() usuario: UsuarioSesion,
    @Body() datos: ActualizarPerfilDto,
  ) {
    return this.usuariosService.actualizar(usuario.id, datos);
  }
}
