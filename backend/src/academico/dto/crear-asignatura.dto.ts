import { IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class CrearAsignaturaDto {
  @IsNotEmpty({ message: 'El código es obligatorio' })
  codigo: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsInt({ message: 'Los créditos deben ser un número entero' })
  @Min(1, { message: 'Los créditos van de 1 a 10' })
  @Max(10, { message: 'Los créditos van de 1 a 10' })
  creditos: number;

  // Sin programa = asignatura transversal (la pueden ver todos los programas)
  @IsOptional()
  @IsInt()
  programaId?: number;
}
