import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_PERMITIDOS } from '../decoradores/roles.decorator.js';
import type { Rol } from '../../usuarios/usuario.entity.js';
import type { RequestConUsuario } from '../usuario-sesion.js';

// Se ejecuta DESPUÉS del AutenticacionGuard. Si la ruta tiene @Roles(...),
// revisa que el rol del usuario esté en la lista.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const rolesPermitidos = this.reflector.getAllAndOverride<Rol[]>(
      ROLES_PERMITIDOS,
      [contexto.getHandler(), contexto.getClass()],
    );
    // Sin @Roles -> cualquier usuario con sesión puede entrar
    if (!rolesPermitidos) return true;

    const { usuario } = contexto.switchToHttp().getRequest<RequestConUsuario>();
    if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
      throw new ForbiddenException('No tienes permiso para hacer esto');
    }
    return true;
  }
}
