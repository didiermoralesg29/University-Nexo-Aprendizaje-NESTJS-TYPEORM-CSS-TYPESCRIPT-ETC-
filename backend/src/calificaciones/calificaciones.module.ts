import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evaluacion } from './evaluacion.entity.js';
import { Nota } from './nota.entity.js';
import { Inscripcion } from '../clases/inscripcion.entity.js';
import { ClasesModule } from '../clases/clases.module.js';
import { CalificacionesController } from './calificaciones.controller.js';
import { CalificacionesService } from './calificaciones.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evaluacion, Nota, Inscripcion]),
    ClasesModule,
  ],
  controllers: [CalificacionesController],
  providers: [CalificacionesService],
  exports: [CalificacionesService], // lo usan los reportes
})
export class CalificacionesModule {}
