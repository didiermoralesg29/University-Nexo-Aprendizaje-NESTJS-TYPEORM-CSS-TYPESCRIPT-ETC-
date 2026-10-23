import { IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class CrearEvaluacionDto {
  @IsNotEmpty({ message: 'Escribe el nombre de la evaluación (ej: Parcial 1)' })
  nombre: string;

  @IsInt({ message: 'El porcentaje debe ser un número entero' })
  @Min(1, { message: 'El porcentaje va de 1 a 100' })
  @Max(100, { message: 'El porcentaje va de 1 a 100' })
  porcentaje: number;
}

export class ActualizarEvaluacionDto {
  @IsOptional()
  @IsNotEmpty({ message: 'El nombre no puede quedar vacío' })
  nombre?: string;

  @IsOptional()
  @IsInt({ message: 'El porcentaje debe ser un número entero' })
  @Min(1, { message: 'El porcentaje va de 1 a 100' })
  @Max(100, { message: 'El porcentaje va de 1 a 100' })
  porcentaje?: number;
}
