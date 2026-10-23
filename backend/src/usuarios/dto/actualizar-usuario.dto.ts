import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

// Igual que CrearUsuarioDto pero todo es opcional (solo se cambia lo que se envía).
// El rol no se puede cambiar.
export class ActualizarUsuarioDto {
  @IsOptional()
  @IsNotEmpty({ message: 'El nombre no puede quedar vacío' })
  nombre?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Escribe un correo válido' })
  email?: string;

  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena?: string;

  @IsOptional()
  @IsString()
  documento?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsInt({ message: 'Elige un programa' })
  programaId?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'El semestre va de 1 a 12' })
  @Max(12, { message: 'El semestre va de 1 a 12' })
  semestre?: number;

  @IsOptional()
  @IsString()
  departamento?: string;

  // false = el usuario queda desactivado y no puede iniciar sesión
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
