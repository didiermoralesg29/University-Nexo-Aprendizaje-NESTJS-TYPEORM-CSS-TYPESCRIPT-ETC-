import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import bcrypt from 'bcryptjs';
import { Usuario } from '../usuarios/usuario.entity.js';
import { Programa } from '../academico/programa.entity.js';
import { Asignatura } from '../academico/asignatura.entity.js';
import { Clase } from '../clases/clase.entity.js';
import { Inscripcion } from '../clases/inscripcion.entity.js';
import { Evaluacion } from '../calificaciones/evaluacion.entity.js';
import { Nota } from '../calificaciones/nota.entity.js';
import { Asistencia } from '../asistencia/asistencia.entity.js';
import { Material } from '../material/material.entity.js';
import { fechaAnterior, fechaISO, periodoActual } from '../comun/horarios.js';
import { redondear } from '../comun/calculos.js';
import * as datos from './datos-semilla.js';

// OnApplicationBootstrap: Nest llama a onApplicationBootstrap() cuando la app ya arrancó
@Injectable()
export class SemillaService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Semilla');

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    const hayUsuarios =
      (await this.dataSource.getRepository(Usuario).count()) > 0;
    if (hayUsuarios) return;

    this.logger.log('Base de datos vacía: creando datos de ejemplo...');
    // Una transacción: o se guarda TODO, o no se guarda nada si algo falla
    await this.dataSource.transaction((manager) => this.sembrar(manager));
    this.logger.log(
      `Listo. Contraseña de todos los usuarios: ${datos.CONTRASENA_DEMO}`,
    );
  }

  private async sembrar(manager: EntityManager) {
    const contrasena = await bcrypt.hash(datos.CONTRASENA_DEMO, 10);
    const periodo = periodoActual();
    const hoy = new Date();

    const programas = await manager.save(
      datos.PROGRAMAS.map((p) => manager.create(Programa, p)),
    );

    const asignaturas = await manager.save(
      datos.ASIGNATURAS.map((a) =>
        manager.create(Asignatura, {
          codigo: a.codigo,
          nombre: a.nombre,
          creditos: a.creditos,
          programa: a.programa === null ? null : programas[a.programa],
        }),
      ),
    );

    await manager.save(
      manager.create(Usuario, { ...datos.RECTOR, contrasena, rol: 'rector' }),
    );

    const profesores = await manager.save(
      datos.PROFESORES.map((p) =>
        manager.create(Usuario, { ...p, contrasena, rol: 'profesor' }),
      ),
    );

    const anio = hoy.getFullYear();
    const estudiantes = await manager.save(
      datos.ESTUDIANTES.map((e, i) =>
        manager.create(Usuario, {
          nombre: e.nombre,
          email: datos.correoInstitucional(e.nombre),
          contrasena,
          rol: 'estudiante',
          codigo: `${anio}${String(i + 1).padStart(4, '0')}`,
          programa: programas[e.programa],
          semestre: e.semestre,
        }),
      ),
    );

    const clases = await manager.save(
      datos.CLASES.map((c) =>
        manager.create(Clase, {
          asignatura: asignaturas[c.asignatura],
          profesor: profesores[c.profesor],
          periodo,
          grupo: 'A',
          dia: c.dia,
          horaInicio: c.horaInicio,
          horaFin: c.horaFin,
          salon: c.salon,
          cupo: c.cupo,
        }),
      ),
    );

    // Inscripciones: cada estudiante toma las clases de su programa
    const inscripciones: Inscripcion[] = [];
    for (const [i, estudiante] of estudiantes.entries()) {
      for (const indiceClase of datos.CLASES_POR_PROGRAMA[
        datos.ESTUDIANTES[i].programa
      ]) {
        inscripciones.push(
          manager.create(Inscripcion, {
            estudiante,
            clase: clases[indiceClase],
          }),
        );
      }
    }
    await manager.save(inscripciones);

    // Evaluaciones y notas. La fórmula solo inventa notas variadas entre 2.0 y 5.0.
    for (const clase of clases) {
      const evaluaciones = await manager.save(
        datos.EVALUACIONES.map((e) =>
          manager.create(Evaluacion, {
            clase,
            nombre: e.nombre,
            porcentaje: e.porcentaje,
          }),
        ),
      );
      const deLaClase = inscripciones.filter((i) => i.clase.id === clase.id);
      const notas: Nota[] = [];
      for (const [j, evaluacion] of evaluaciones.entries()) {
        if (!datos.EVALUACIONES[j].conNotas) continue;
        for (const inscripcion of deLaClase) {
          const valor = redondear(
            2 + ((inscripcion.estudiante.id * 7 + evaluacion.id * 5) % 31) / 10,
          );
          notas.push(manager.create(Nota, { evaluacion, inscripcion, valor }));
        }
      }
      await manager.save(notas);
    }

    // Asistencia de las últimas 4 semanas. Santiago Ramírez falta una semana sí y otra no.
    const asistencias: Asistencia[] = [];
    for (const inscripcion of inscripciones) {
      for (let semana = 0; semana < 4; semana++) {
        const fecha = fechaISO(
          fechaAnterior(inscripcion.clase.dia, hoy, semana),
        );
        const faltaSeguido =
          inscripcion.estudiante.nombre === 'Santiago Ramírez' &&
          semana % 2 === 0;
        const presente =
          !faltaSeguido && (inscripcion.id * 3 + semana * 5) % 7 !== 0;
        asistencias.push(
          manager.create(Asistencia, { inscripcion, fecha, presente }),
        );
      }
    }
    await manager.save(asistencias);

    await manager.save(
      datos.MATERIALES.map((m) =>
        manager.create(Material, {
          clase: clases[m.clase],
          titulo: m.titulo,
          descripcion: m.descripcion,
          tipo: m.tipo,
          enlace: m.enlace,
        }),
      ),
    );
  }
}
