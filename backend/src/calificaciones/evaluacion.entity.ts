import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Clase } from '../clases/clase.entity.js';

// Una "columna" de la planilla de notas: "Parcial 1 (30%)", "Final (40%)"...
@Entity('evaluaciones')
export class Evaluacion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Clase, { onDelete: 'CASCADE' })
  clase: Relation<Clase>;

  @Column()
  nombre: string;

  @Column({ type: 'int' })
  porcentaje: number; // peso en la nota definitiva (la suma no puede pasar de 100)
}
