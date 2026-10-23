import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { configurarApp } from './configurar-app.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configurarApp(app);

  // El puerto se lee del archivo .env (o 3000 si no existe)
  const puerto = app.get(ConfigService).get<number>('PORT', 3000);
  await app.listen(puerto);
  console.log(`API de Nexo University en http://localhost:${puerto}/api`);
}
await bootstrap();
