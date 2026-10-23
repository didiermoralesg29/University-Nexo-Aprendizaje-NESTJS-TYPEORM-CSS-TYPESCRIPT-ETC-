import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Clase } from '../clases/clase.entity.js';

export const TIPOS_MATERIAL = [
  'PDF',
  'Video',
  'Presentación',
  'Enlace',
] as const;
export type TipoMaterial = (typeof TIPOS_MATERIAL)[number];

@Entity('materiales')
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Clase, { eager: true, onDelete: 'CASCADE' })
  clase: Relation<Clase>;

  @Column()
  titulo: string;

  @Column({ type: 'text', default: '' })
  descripcion: string;

  @Column({ type: 'enum', enum: TIPOS_MATERIAL })
  tipo: TipoMaterial;

  @Column()
  enlace: string;

  @CreateDateColumn()
  creadoEn: Date;
}
