import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clase } from './clase.entity.js';
import { Inscripcion } from './inscripcion.entity.js';
import { Asignatura } from '../academico/asignatura.entity.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { ClasesController } from './clases.controller.js';
import { ClasesService } from './clases.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Clase, Inscripcion, Asignatura, Usuario]),
  ],
  controllers: [ClasesController],
  providers: [ClasesService],
  // Lo exportamos para que notas, asistencia, material y reportes
  // reutilicen las reglas de permisos (buscarParaGestionar / buscarParaVer)
  exports: [ClasesService],
})
export class ClasesModule {}
