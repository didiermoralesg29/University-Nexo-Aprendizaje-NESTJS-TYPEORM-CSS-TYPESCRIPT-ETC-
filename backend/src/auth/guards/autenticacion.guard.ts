import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ES_PUBLICO } from '../decoradores/publico.decorator.js';
import type { RequestConUsuario, UsuarioSesion } from '../usuario-sesion.js';

interface ContenidoToken {
  sub: number;
  rol: UsuarioSesion['rol'];
  nombre: string;
}

// Un "guard" (guardia) decide si una petición puede pasar o no.
// Este revisa que traiga un token JWT válido en la cabecera:
//   Authorization: Bearer <token>
@Injectable()
export class AutenticacionGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    // ¿La ruta tiene @Publico()? Entonces no pedimos token.
    const esPublico = this.reflector.getAllAndOverride<boolean>(ES_PUBLICO, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (esPublico) return true;

    const request = contexto.switchToHttp().getRequest<RequestConUsuario>();
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Debes iniciar sesión');
    }

    try {
      const contenido = await this.jwt.verifyAsync<ContenidoToken>(token);
      request.usuario = {
        id: contenido.sub,
        rol: contenido.rol,
        nombre: contenido.nombre,
      };
      return true;
    } catch {
      throw new UnauthorizedException(
        'Tu sesión expiró, vuelve a iniciar sesión',
      );
    }
  }
}
