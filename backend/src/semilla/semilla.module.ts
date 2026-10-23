import { Module } from '@nestjs/common';
import { SemillaService } from './semilla.service.js';

// No necesita imports: usa el DataSource de TypeORM, que está disponible en toda la app
@Module({
  providers: [SemillaService],
})
export class SemillaModule {}
