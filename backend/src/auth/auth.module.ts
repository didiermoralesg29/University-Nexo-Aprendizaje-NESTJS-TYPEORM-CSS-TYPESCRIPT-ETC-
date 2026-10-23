import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AutenticacionGuard } from './guards/autenticacion.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
  imports: [
    UsuariosModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRETO'),
        signOptions: { expiresIn: '8h' }, // la sesión dura 8 horas
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // APP_GUARD aplica los guards a TODAS las rutas de la aplicación, en este orden.
    // Así, por defecto todo está protegido y solo @Publico() abre una ruta.
    { provide: APP_GUARD, useClass: AutenticacionGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
