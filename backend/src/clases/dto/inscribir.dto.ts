import { IsInt, IsOptional } from 'class-validator';

export class InscribirDto {
  // Solo lo usa el rector para inscribir a otro estudiante.
  // Un estudiante siempre se inscribe a sí mismo.
  @IsOptional()
  @IsInt({ message: 'Elige un estudiante' })
  estudianteId?: number;
}
