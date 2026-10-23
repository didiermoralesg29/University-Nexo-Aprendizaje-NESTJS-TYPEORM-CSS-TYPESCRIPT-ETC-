import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Inscripcion } from '../clases/inscripcion.entity.js';

// ¿Asistió este estudiante (inscripción) a la clase en esta fecha?
@Entity('asistencias')
@Unique(['inscripcion', 'fecha'])
export class Asistencia {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Inscripcion, (inscripcion) => inscripcion.asistencias, {
    onDelete: 'CASCADE',
  })
  inscripcion: Relation<Inscripcion>;

  @Column({ type: 'date' })
  fecha: string; // 'AAAA-MM-DD'

  @Column()
  presente: boolean;
}
