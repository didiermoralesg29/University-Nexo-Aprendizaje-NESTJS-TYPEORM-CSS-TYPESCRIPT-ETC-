import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { DIAS, type Dia } from '../../comun/horarios.js';

// Expresión regular para horas 'HH:mm' de 00:00 a 23:59
export const FORMATO_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CrearClaseDto {
  @IsInt({ message: 'Elige una asignatura' })
  asignaturaId: number;

  // Solo lo usa el rector. Si la crea un profesor, la clase queda a su nombre.
  @IsOptional()
  @IsInt({ message: 'Elige un profesor' })
  profesorId?: number;

  @IsOptional()
  @Matches(/^\d{4}-[12]$/, { message: 'El periodo debe tener la forma 2026-2' })
  periodo?: string;

  @IsOptional()
  @IsNotEmpty()
  grupo?: string;

  @IsIn(DIAS, { message: 'Elige un día de lunes a sábado' })
  dia: Dia;

  @Matches(FORMATO_HORA, {
    message: 'La hora de inicio debe tener la forma 07:00',
  })
  horaInicio: string;

  @Matches(FORMATO_HORA, {
    message: 'La hora de fin debe tener la forma 09:00',
  })
  horaFin: string;

  @IsNotEmpty({ message: 'El salón es obligatorio' })
  salon: string;

  @IsInt({ message: 'El cupo debe ser un número' })
  @Min(1, { message: 'El cupo mínimo es 1' })
  @Max(200, { message: 'El cupo máximo es 200' })
  cupo: number;
}
