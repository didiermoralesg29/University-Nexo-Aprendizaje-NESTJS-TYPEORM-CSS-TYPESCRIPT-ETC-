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
import { FORMATO_HORA } from './crear-clase.dto.js';

// Todo opcional: solo se cambia lo que se envía
export class ActualizarClaseDto {
  @IsOptional()
  @IsInt({ message: 'Elige un profesor' })
  profesorId?: number;

  @IsOptional()
  @IsNotEmpty()
  grupo?: string;

  @IsOptional()
  @IsIn(DIAS, { message: 'Elige un día de lunes a sábado' })
  dia?: Dia;

  @IsOptional()
  @Matches(FORMATO_HORA, {
    message: 'La hora de inicio debe tener la forma 07:00',
  })
  horaInicio?: string;

  @IsOptional()
  @Matches(FORMATO_HORA, {
    message: 'La hora de fin debe tener la forma 09:00',
  })
  horaFin?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'El salón no puede quedar vacío' })
  salon?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'El cupo mínimo es 1' })
  @Max(200, { message: 'El cupo máximo es 200' })
  cupo?: number;
}
