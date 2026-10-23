import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { TIPOS_MATERIAL, type TipoMaterial } from '../material.entity.js';

export class CrearMaterialDto {
  @IsNotEmpty({ message: 'El título es obligatorio' })
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsIn(TIPOS_MATERIAL, {
    message: 'El tipo debe ser PDF, Video, Presentación o Enlace',
  })
  tipo: TipoMaterial;

  @IsUrl({}, { message: 'El enlace debe ser una dirección web (https://...)' })
  enlace: string;
}
