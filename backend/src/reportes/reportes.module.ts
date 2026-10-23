import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/usuario.entity.js';
import { Inscripcion } from '../clases/inscripcion.entity.js';
import { ClasesModule } from '../clases/clases.module.js';
import { CalificacionesModule } from '../calificaciones/calificaciones.module.js';
import { ReportesController } from './reportes.controller.js';
import { ReportesService } from './reportes.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Inscripcion]),
    ClasesModule,
    CalificacionesModule,
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
