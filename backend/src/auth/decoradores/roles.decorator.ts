import { SetMetadata } from '@nestjs/common';
import type { Rol } from '../../usuarios/usuario.entity.js';

export const ROLES_PERMITIDOS = 'rolesPermitidos';

// Indica qué roles pueden usar una ruta. Uso: @Roles('rector', 'profesor')
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_PERMITIDOS, roles);
