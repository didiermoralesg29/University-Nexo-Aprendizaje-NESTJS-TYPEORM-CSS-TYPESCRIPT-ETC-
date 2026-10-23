import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity.js';
import { Programa } from '../academico/programa.entity.js';
import { UsuariosController } from './usuarios.controller.js';
import { UsuariosService } from './usuarios.service.js';

@Module({
  // forFeature registra las tablas que este módulo va a consultar
  imports: [TypeOrmModule.forFeature([Usuario, Programa])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
