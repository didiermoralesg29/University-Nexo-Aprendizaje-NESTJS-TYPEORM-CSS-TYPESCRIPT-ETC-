import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asistencia } from './asistencia.entity.js';
import { Inscripcion } from '../clases/inscripcion.entity.js';
import { ClasesModule } from '../clases/clases.module.js';
import { AsistenciaController } from './asistencia.controller.js';
import { AsistenciaService } from './asistencia.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Asistencia, Inscripcion]), ClasesModule],
  controllers: [AsistenciaController],
  providers: [AsistenciaService],
})
export class AsistenciaModule {}
