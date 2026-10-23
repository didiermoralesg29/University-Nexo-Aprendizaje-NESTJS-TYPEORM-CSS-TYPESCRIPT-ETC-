import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity.js';
import { Clase } from './clase.entity.js';
import { Nota } from '../calificaciones/nota.entity.js';
import { Asistencia } from '../asistencia/asistencia.entity.js';

// Une a un estudiante con una clase (la "matrícula" en esa materia).
// @Unique impide inscribir dos veces al mismo estudiante en la misma clase.
@Entity('inscripciones')
@Unique(['estudiante', 'clase'])
export class Inscripcion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { eager: true, onDelete: 'CASCADE' })
  estudiante: Relation<Usuario>;

  // onDelete: 'CASCADE' -> si se borra la clase, se borran sus inscripciones
  @ManyToOne(() => Clase, (clase) => clase.inscripciones, {
    onDelete: 'CASCADE',
  })
  clase: Relation<Clase>;

  @OneToMany(() => Nota, (nota) => nota.inscripcion)
  notas: Relation<Nota>[];

  @OneToMany(() => Asistencia, (asistencia) => asistencia.inscripcion)
  asistencias: Relation<Asistencia>[];

  @CreateDateColumn()
  creadaEn: Date;
}
