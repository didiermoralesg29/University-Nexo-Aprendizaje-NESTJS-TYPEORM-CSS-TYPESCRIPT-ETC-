// Datos de ejemplo de Nexo University. Se insertan solo si la base de datos está vacía.
import type { Dia } from '../comun/horarios.js';
import type { TipoMaterial } from '../material/material.entity.js';

export const CONTRASENA_DEMO = 'nexo123';

export const PROGRAMAS = [
  { nombre: 'Ingeniería de Sistemas', facultad: 'Facultad de Ingeniería' },
  {
    nombre: 'Administración de Empresas',
    facultad: 'Facultad de Ciencias Económicas',
  },
  { nombre: 'Psicología', facultad: 'Facultad de Ciencias Humanas' },
];

// programa: índice en PROGRAMAS (null = transversal)
export const ASIGNATURAS = [
  { codigo: 'IS101', nombre: 'Programación I', creditos: 4, programa: 0 },
  { codigo: 'IS102', nombre: 'Cálculo Diferencial', creditos: 4, programa: 0 },
  { codigo: 'IS201', nombre: 'Bases de Datos', creditos: 3, programa: 0 },
  {
    codigo: 'AD101',
    nombre: 'Fundamentos de Administración',
    creditos: 3,
    programa: 1,
  },
  { codigo: 'AD102', nombre: 'Contabilidad General', creditos: 3, programa: 1 },
  {
    codigo: 'PS101',
    nombre: 'Introducción a la Psicología',
    creditos: 3,
    programa: 2,
  },
  {
    codigo: 'PS102',
    nombre: 'Estadística Descriptiva',
    creditos: 3,
    programa: 2,
  },
  {
    codigo: 'TR001',
    nombre: 'Comunicación Oral y Escrita',
    creditos: 2,
    programa: null,
  },
];

export const RECTOR = {
  nombre: 'Laura Mendoza',
  email: 'rector@nexo.edu.co',
  documento: '52123456',
};

export const PROFESORES = [
  {
    nombre: 'Ana Gómez',
    email: 'ana.gomez@nexo.edu.co',
    departamento: 'Ingeniería',
  },
  {
    nombre: 'Carlos Ruiz',
    email: 'carlos.ruiz@nexo.edu.co',
    departamento: 'Ciencias Económicas',
  },
  {
    nombre: 'María López',
    email: 'maria.lopez@nexo.edu.co',
    departamento: 'Ciencias Humanas',
  },
  {
    nombre: 'Jorge Díaz',
    email: 'jorge.diaz@nexo.edu.co',
    departamento: 'Ciencias Básicas',
  },
];

export const ESTUDIANTES = [
  { nombre: 'Sofía Martínez', programa: 0, semestre: 1 },
  { nombre: 'Mateo Hernández', programa: 0, semestre: 1 },
  { nombre: 'Valentina Torres', programa: 0, semestre: 2 },
  { nombre: 'Santiago Ramírez', programa: 0, semestre: 1 },
  { nombre: 'Isabella Castro', programa: 0, semestre: 3 },
  { nombre: 'Samuel Rojas', programa: 1, semestre: 1 },
  { nombre: 'Mariana Vargas', programa: 1, semestre: 2 },
  { nombre: 'Nicolás Moreno', programa: 1, semestre: 1 },
  { nombre: 'Gabriela Ortiz', programa: 1, semestre: 1 },
  { nombre: 'Lucía Herrera', programa: 2, semestre: 1 },
  { nombre: 'Daniel Medina', programa: 2, semestre: 2 },
  { nombre: 'Camila Restrepo', programa: 2, semestre: 1 },
];

// asignatura y profesor: índices en las listas de arriba
export const CLASES: {
  asignatura: number;
  profesor: number;
  dia: Dia;
  horaInicio: string;
  horaFin: string;
  salon: string;
  cupo: number;
}[] = [
  { asignatura: 0, profesor: 0, dia: 'Lunes', horaInicio: '07:00', horaFin: '09:00', salon: 'B-201', cupo: 30 },
  { asignatura: 1, profesor: 3, dia: 'Martes', horaInicio: '09:00', horaFin: '11:00', salon: 'A-105', cupo: 35 },
  { asignatura: 2, profesor: 0, dia: 'Jueves', horaInicio: '14:00', horaFin: '16:00', salon: 'Lab. Sistemas 2', cupo: 25 },
  { asignatura: 3, profesor: 1, dia: 'Miércoles', horaInicio: '07:00', horaFin: '09:00', salon: 'C-302', cupo: 40 },
  { asignatura: 4, profesor: 1, dia: 'Jueves', horaInicio: '09:00', horaFin: '11:00', salon: 'C-302', cupo: 40 },
  { asignatura: 5, profesor: 2, dia: 'Lunes', horaInicio: '11:00', horaFin: '13:00', salon: 'D-101', cupo: 30 },
  { asignatura: 6, profesor: 3, dia: 'Viernes', horaInicio: '07:00', horaFin: '09:00', salon: 'A-105', cupo: 35 },
  { asignatura: 7, profesor: 2, dia: 'Miércoles', horaInicio: '14:00', horaFin: '16:00', salon: 'D-204', cupo: 45 },
]; // prettier-ignore

// Qué clases (índices) inscribe cada programa
export const CLASES_POR_PROGRAMA = [
  [0, 1, 2, 7], // Sistemas
  [3, 4, 7], // Administración
  [5, 6, 7], // Psicología
];

// Evaluaciones de cada clase. Solo las que tienen conNotas: true ya fueron calificadas.
export const EVALUACIONES = [
  { nombre: 'Parcial 1', porcentaje: 30, conNotas: true },
  { nombre: 'Parcial 2', porcentaje: 30, conNotas: true },
  { nombre: 'Examen final', porcentaje: 40, conNotas: false },
];

// clase: índice en CLASES
export const MATERIALES: {
  clase: number;
  titulo: string;
  descripcion: string;
  tipo: TipoMaterial;
  enlace: string;
}[] = [
  { clase: 0, titulo: 'Tutorial oficial de Python', descripcion: 'Lectura de los capítulos 1 a 4 antes del parcial.', tipo: 'Enlace', enlace: 'https://docs.python.org/es/3/tutorial/' },
  { clase: 1, titulo: 'Límites y continuidad', descripcion: 'Videos y ejercicios para practicar límites.', tipo: 'Video', enlace: 'https://es.khanacademy.org/math/differential-calculus' },
  { clase: 2, titulo: 'Documentación de PostgreSQL', descripcion: 'Referencia de SQL usada en los laboratorios.', tipo: 'Enlace', enlace: 'https://www.postgresql.org/docs/' },
  { clase: 3, titulo: 'Las funciones administrativas', descripcion: 'Lectura sobre planeación, organización, dirección y control.', tipo: 'PDF', enlace: 'https://es.wikipedia.org/wiki/Administraci%C3%B3n' },
  { clase: 5, titulo: 'Historia de la psicología', descripcion: 'Presentación de la primera unidad.', tipo: 'Presentación', enlace: 'https://es.wikipedia.org/wiki/Historia_de_la_psicolog%C3%ADa' },
  { clase: 6, titulo: 'Medidas de tendencia central', descripcion: 'Media, mediana y moda con ejemplos.', tipo: 'Video', enlace: 'https://es.khanacademy.org/math/statistics-probability' },
]; // prettier-ignore

// "sofía martínez" -> "sofia.martinez@nexo.edu.co"
export function correoInstitucional(nombre: string) {
  const sinTildes = nombre.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return `${sinTildes.toLowerCase().replace(/\s+/g, '.')}@nexo.edu.co`;
}
