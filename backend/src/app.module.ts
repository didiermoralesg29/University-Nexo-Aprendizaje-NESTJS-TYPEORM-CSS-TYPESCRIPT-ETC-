import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuracionBaseDatos } from './config/base-datos.config.js';
import { AuthModule } from './auth/auth.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { AcademicoModule } from './academico/academico.module.js';
import { ClasesModule } from './clases/clases.module.js';
import { CalificacionesModule } from './calificaciones/calificaciones.module.js';
import { AsistenciaModule } from './asistencia/asistencia.module.js';
import { MaterialModule } from './material/material.module.js';
import { ReportesModule } from './reportes/reportes.module.js';
import { SemillaModule } from './semilla/semilla.module.js';

@Module({
  imports: [
    // Lee el archivo .env; isGlobal lo deja disponible en toda la app
    ConfigModule.forRoot({ isGlobal: true }),
    // Conexión a PostgreSQL. forRootAsync espera a que ConfigService esté listo.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: configuracionBaseDatos,
    }),
    // Un módulo por cada área de la universidad
    AuthModule,
    UsuariosModule,
    AcademicoModule,
    ClasesModule,
    CalificacionesModule,
    AsistenciaModule,
    MaterialModule,
    ReportesModule,
    SemillaModule,
  ],
})
export class AppModule {}
