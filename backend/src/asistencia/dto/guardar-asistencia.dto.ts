import { IsArray, IsInt, Matches } from 'class-validator';

export class GuardarAsistenciaDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener la forma AAAA-MM-DD',
  })
  fecha: string;

  // Ids de las inscripciones (estudiantes) que estuvieron PRESENTES.
  // Los que no aparezcan en la lista quedan como ausentes.
  @IsArray()
  @IsInt({ each: true })
  presentes: number[];
}
