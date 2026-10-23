import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Programa } from '../academico/programa.entity.js';

export const ROLES = ['estudiante', 'profesor', 'rector'] as const;
export type Rol = (typeof ROLES)[number];

// Todas las personas que inician sesión: estudiantes, profesores y el rector.
// Algunos campos solo aplican a un rol (por eso pueden ser null).
@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  // Guardamos un HASH de la contraseña, nunca la contraseña real.
  // select: false -> no se incluye en las consultas a menos que se pida.
  @Column({ select: false })
  contrasena: string;

  @Column({ type: 'enum', enum: ROLES })
  rol: Rol;

  @Column({ type: 'varchar', nullable: true })
  documento: string | null;

  @Column({ type: 'varchar', nullable: true })
  telefono: string | null;

  @Column({ default: true })
  activo: boolean;

  // ----- Solo estudiantes -----
  @Column({ type: 'varchar', nullable: true, unique: true })
  codigo: string | null;

  @ManyToOne(() => Programa, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  programa: Relation<Programa> | null;

  @Column({ type: 'int', nullable: true })
  semestre: number | null;

  // ----- Solo profesores -----
  @Column({ type: 'varchar', nullable: true })
  departamento: string | null;

  @CreateDateColumn()
  creadoEn: Date;
}
