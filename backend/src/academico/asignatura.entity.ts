import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Programa } from './programa.entity.js';

// Una materia del plan de estudios, por ejemplo "IS101 - Programación I".
@Entity('asignaturas')
export class Asignatura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: string;

  @Column()
  nombre: string;

  @Column({ type: 'int' })
  creditos: number;

  // Muchas asignaturas pertenecen a un programa. null = asignatura transversal.
  // eager: true -> siempre se carga junto con la asignatura
  @ManyToOne(() => Programa, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  programa: Relation<Programa> | null;
}
