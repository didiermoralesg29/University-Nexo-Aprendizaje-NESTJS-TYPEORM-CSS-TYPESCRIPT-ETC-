import { INestApplication, ValidationPipe } from '@nestjs/common';

// Configuración común de la API. La usan main.ts y las pruebas e2e.
export function configurarApp(app: INestApplication) {
  // Todas las rutas empiezan por /api (ej: /api/clases)
  app.setGlobalPrefix('api');

  // Valida automáticamente los DTO de cada petición:
  //  whitelist -> borra campos que no estén en el DTO
  //  forbidNonWhitelisted -> y responde error 400 si llegan campos desconocidos
  //  transform -> convierte el JSON en instancias de la clase DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
