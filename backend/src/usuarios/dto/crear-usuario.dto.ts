import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ROLES, type Rol } from '../usuario.entity.js';

export class CrearUsuarioDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsEmail({}, { message: 'Escribe un correo válido' })
  email: string;

  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena: string;

  @IsIn(ROLES, { message: 'El rol debe ser estudiante, profesor o rector' })
  rol: Rol;

  @IsOptional()
  @IsString()
  documento?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  // ----- Estudiantes -----
  @IsOptional()
  @IsString()
  codigo?: string; // si no se envía, se genera automáticamente

  @IsOptional()
  @IsInt({ message: 'Elige un programa' })
  programaId?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'El semestre va de 1 a 12' })
  @Max(12, { message: 'El semestre va de 1 a 12' })
  semestre?: number;

  // ----- Profesores -----
  @IsOptional()
  @IsString()
  departamento?: string;
}
