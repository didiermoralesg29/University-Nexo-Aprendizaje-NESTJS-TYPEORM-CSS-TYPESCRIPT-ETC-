import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Programa } from './programa.entity.js';
import { Asignatura } from './asignatura.entity.js';
import { AcademicoController } from './academico.controller.js';
import { AcademicoService } from './academico.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Programa, Asignatura])],
  controllers: [AcademicoController],
  providers: [AcademicoService],
})
export class AcademicoModule {}
