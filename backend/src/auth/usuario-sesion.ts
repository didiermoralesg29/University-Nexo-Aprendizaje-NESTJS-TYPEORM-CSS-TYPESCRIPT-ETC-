import type { Request } from 'express';
import type { Rol } from '../usuarios/usuario.entity.js';

// Lo que sabemos del usuario que hace la petición (sale del token JWT)
export interface UsuarioSesion {
  id: number;
  rol: Rol;
  nombre: string;
}

// La petición de Express, con el usuario que agrega el AutenticacionGuard
export interface RequestConUsuario extends Request {
  usuario?: UsuarioSesion;
}
