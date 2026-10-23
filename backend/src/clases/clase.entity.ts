import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Asignatura } from '../academico/asignatura.entity.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { DIAS, type Dia } from '../comun/horarios.js';
import { Inscripcion } from './inscripcion.entity.js';

// Una clase es un GRUPO de una asignatura en un periodo:
// "Programación I, grupo A, 2026-2, lunes 07:00-09:00, con la profesora Ana".
@Entity('clases')
export class Clase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Asignatura, { eager: true, onDelete: 'RESTRICT' })
  asignatura: Relation<Asignatura>;

  @ManyToOne(() => Usuario, { eager: true, onDelete: 'RESTRICT' })
  profesor: Relation<Usuario>;

  @Column()
  periodo: string; // ejemplo: '2026-2'

  @Column({ default: 'A' })
  grupo: string;

  @Column({ type: 'enum', enum: DIAS })
  dia: Dia;

  @Column({ length: 5 })
  horaInicio: string; // 'HH:mm'

  @Column({ length: 5 })
  horaFin: string;

  @Column()
  salon: string;

  @Column({ type: 'int' })
  cupo: number;

  @OneToMany(() => Inscripcion, (inscripcion) => inscripcion.clase)
  inscripciones: Relation<Inscripcion>[];
}
