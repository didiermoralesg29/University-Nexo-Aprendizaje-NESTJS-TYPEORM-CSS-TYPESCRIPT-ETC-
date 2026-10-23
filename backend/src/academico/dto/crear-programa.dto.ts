import { IsNotEmpty } from 'class-validator';

export class CrearProgramaDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsNotEmpty({ message: 'La facultad es obligatoria' })
  facultad: string;
}
