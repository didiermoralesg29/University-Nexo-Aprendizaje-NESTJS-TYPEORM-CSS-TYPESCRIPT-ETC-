import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './material.entity.js';
import { ClasesModule } from '../clases/clases.module.js';
import { MaterialController } from './material.controller.js';
import { MaterialService } from './material.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Material]), ClasesModule],
  controllers: [MaterialController],
  providers: [MaterialService],
})
export class MaterialModule {}
