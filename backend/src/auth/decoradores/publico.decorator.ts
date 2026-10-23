import { SetMetadata } from '@nestjs/common';

export const ES_PUBLICO = 'esPublico';

// Marca una ruta como pública: no necesita haber iniciado sesión.
// Uso: @Publico() encima del método del controlador.
export const Publico = () => SetMetadata(ES_PUBLICO, true);
