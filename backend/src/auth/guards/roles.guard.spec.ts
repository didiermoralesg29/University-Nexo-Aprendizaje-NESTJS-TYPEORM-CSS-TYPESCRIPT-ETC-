import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';
import type { Rol } from '../../usuarios/usuario.entity.js';

// Crea un contexto falso con el usuario y los roles que pide la ruta
function contextoFalso(rolUsuario: Rol, rolesRuta: Rol[] | undefined) {
  const reflector = {
    getAllAndOverride: () => rolesRuta,
  } as unknown as Reflector;
  const contexto = {
    getHandler: () => null,
    getClass: () => null,
    switchToHttp: () => ({
      getRequest: () => ({ usuario: { id: 1, rol: rolUsuario, nombre: 'X' } }),
    }),
  } as unknown as ExecutionContext;
  return { guard: new RolesGuard(reflector), contexto };
}

describe('RolesGuard', () => {
  it('deja pasar si la ruta no pide roles', () => {
    const { guard, contexto } = contextoFalso('estudiante', undefined);
    expect(guard.canActivate(contexto)).toBe(true);
  });

  it('deja pasar al rector en una ruta solo para rector', () => {
    const { guard, contexto } = contextoFalso('rector', ['rector']);
    expect(guard.canActivate(contexto)).toBe(true);
  });

  it('bloquea a un estudiante en una ruta de profesores', () => {
    const { guard, contexto } = contextoFalso('estudiante', [
      'profesor',
      'rector',
    ]);
    expect(() => guard.canActivate(contexto)).toThrow(ForbiddenException);
  });
});
