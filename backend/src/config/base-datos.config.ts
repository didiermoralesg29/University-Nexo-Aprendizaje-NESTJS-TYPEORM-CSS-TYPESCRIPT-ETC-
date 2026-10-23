import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Lee los datos de conexión del archivo .env
export function configuracionBaseDatos(
  config: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: config.get('DB_HOST', 'localhost'),
    port: Number(config.get('DB_PUERTO', 5432)),
    username: config.get('DB_USUARIO', 'postgres'),
    password: config.get('DB_CONTRASENA'),
    database: config.get('DB_NOMBRE', 'nexo_university'),
    // Registra automáticamente las entidades de cada TypeOrmModule.forFeature()
    autoLoadEntities: true,
    // synchronize crea/actualiza las tablas a partir de las entidades.
    // ⚠️ Muy cómodo para aprender, pero en producción se usan "migraciones".
    synchronize: true,
    // Borra todas las tablas al arrancar (solo para pruebas o para reiniciar los datos)
    dropSchema: config.get('DB_REINICIAR') === 'true',
  };
}
