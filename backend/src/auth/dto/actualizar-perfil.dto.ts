import { IsOptional, IsString, MinLength } from 'class-validator';

// Lo que cualquier usuario puede cambiar de sí mismo
export class ActualizarPerfilDto {
  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena?: string;
}
