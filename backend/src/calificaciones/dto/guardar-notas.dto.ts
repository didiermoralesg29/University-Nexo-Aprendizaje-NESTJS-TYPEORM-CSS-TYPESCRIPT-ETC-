import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { NOTA_MAXIMA, NOTA_MINIMA } from '../../comun/calculos.js';

// Una celda de la planilla: la nota de un estudiante en una evaluación
export class CeldaNotaDto {
  @IsInt()
  evaluacionId: number;

  @IsInt()
  inscripcionId: number;

  // null = borrar la nota. Si no es null, debe estar entre 0.0 y 5.0
  @ValidateIf((celda: CeldaNotaDto) => celda.valor !== null)
  @IsNumber({}, { message: 'Las notas deben ser números' })
  @Min(NOTA_MINIMA, {
    message: `Las notas van de ${NOTA_MINIMA} a ${NOTA_MAXIMA}`,
  })
  @Max(NOTA_MAXIMA, {
    message: `Las notas van de ${NOTA_MINIMA} a ${NOTA_MAXIMA}`,
  })
  valor: number | null;
}

export class GuardarNotasDto {
  // @ValidateNested + @Type: valida también cada elemento de la lista
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CeldaNotaDto)
  notas: CeldaNotaDto[];
}
