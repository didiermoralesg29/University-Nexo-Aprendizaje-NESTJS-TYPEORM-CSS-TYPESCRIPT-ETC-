import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Un programa académico (carrera), por ejemplo "Ingeniería de Sistemas".
// @Entity convierte la clase en una TABLA; cada @Column es una COLUMNA.
@Entity('programas')
export class Programa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column()
  facultad: string;
}
