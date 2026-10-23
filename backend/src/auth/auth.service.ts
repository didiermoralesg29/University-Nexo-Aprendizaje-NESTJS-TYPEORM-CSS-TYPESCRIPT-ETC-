import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, contrasena: string) {
    const usuario = await this.usuariosService.buscarConContrasena(email);

    // bcrypt.compare cifra la contraseña escrita y la compara con el hash guardado.
    // Usamos el mismo mensaje en todos los casos para no dar pistas a un atacante.
    const valida =
      usuario !== null &&
      usuario.activo &&
      (await bcrypt.compare(contrasena, usuario.contrasena));
    if (!valida) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    // El token lleva el id, el rol y el nombre, firmados con JWT_SECRETO
    const token = await this.jwt.signAsync({
      sub: usuario.id,
      rol: usuario.rol,
      nombre: usuario.nombre,
    });
    return { token, usuario: await this.usuariosService.buscar(usuario.id) };
  }
}
