import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestConUsuario } from '../usuario-sesion.js';

// Entrega el usuario que inició sesión. Uso en un controlador:
//   miMetodo(@UsuarioActual() usuario: UsuarioSesion) { ... }
export const UsuarioActual = createParamDecorator(
  (_dato: unknown, contexto: ExecutionContext) => {
    const request = contexto.switchToHttp().getRequest<RequestConUsuario>();
    return request.usuario;
  },
);
