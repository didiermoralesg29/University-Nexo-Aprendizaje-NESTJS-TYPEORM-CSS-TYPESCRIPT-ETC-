import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Evaluacion } from './evaluacion.entity.js';
import { Inscripcion } from '../clases/inscripcion.entity.js';

// La nota de UN estudiante (inscripción) en UNA evaluación.
@Entity('notas')
@Unique(['evaluacion', 'inscripcion'])
export class Nota {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Evaluacion, { eager: true, onDelete: 'CASCADE' })
  evaluacion: Relation<Evaluacion>;

  @ManyToOne(() => Inscripcion, (inscripcion) => inscripcion.notas, {
    onDelete: 'CASCADE',
  })
  inscripcion: Relation<Inscripcion>;

  @Column({ type: 'real' })
  valor: number; // escala de 0.0 a 5.0
}
