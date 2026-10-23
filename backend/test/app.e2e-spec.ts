import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configurarApp } from './../src/configurar-app.js';

describe('Nexo University API (e2e)', () => {
  let app: INestApplication;
  let api: ReturnType<typeof request>;

  // Inicia sesión y devuelve el token
  async function login(email: string): Promise<string> {
    const respuesta = await api
      .post('/api/auth/login')
      .send({ email, contrasena: 'nexo123' })
      .expect(200);
    return respuesta.body.token;
  }

  // Se ejecuta UNA vez: arranca la app con la base de datos de prueba
  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modulo.createNestApplication();
    configurarApp(app);
    await app.init();
    api = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('autenticación', () => {
    it('rechaza peticiones sin sesión', () => {
      return api.get('/api/clases').expect(401);
    });

    it('rechaza una contraseña incorrecta', () => {
      return api
        .post('/api/auth/login')
        .send({ email: 'rector@nexo.edu.co', contrasena: 'mala' })
        .expect(401);
    });

    it('devuelve el token y el rol al iniciar sesión', async () => {
      const respuesta = await api
        .post('/api/auth/login')
        .send({ email: 'rector@nexo.edu.co', contrasena: 'nexo123' })
        .expect(200);
      expect(respuesta.body.token).toBeTypeOf('string');
      expect(respuesta.body.usuario.rol).toBe('rector');
    });
  });

  describe('registrar y editar estudiantes', () => {
    it('solo el rector puede registrar estudiantes', async () => {
      const profesor = await login('ana.gomez@nexo.edu.co');
      await api
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${profesor}`)
        .send({
          nombre: 'X',
          email: 'x@nexo.edu.co',
          contrasena: '123456',
          rol: 'estudiante',
          programaId: 1,
        })
        .expect(403);
    });

    it('el rector registra y edita un estudiante', async () => {
      const rector = await login('rector@nexo.edu.co');
      const creado = await api
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${rector}`)
        .send({
          nombre: 'Estudiante Nuevo',
          email: 'nuevo@nexo.edu.co',
          contrasena: '123456',
          rol: 'estudiante',
          programaId: 1,
        })
        .expect(201);
      expect(creado.body.codigo).toMatch(/^\d{8}$/); // código generado automáticamente

      const editado = await api
        .patch(`/api/usuarios/${creado.body.id}`)
        .set('Authorization', `Bearer ${rector}`)
        .send({ semestre: 4 })
        .expect(200);
      expect(editado.body.semestre).toBe(4);
    });

    it('valida los datos y responde en español', async () => {
      const rector = await login('rector@nexo.edu.co');
      const respuesta = await api
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${rector}`)
        .send({ nombre: 'Sin correo', contrasena: '123', rol: 'estudiante' })
        .expect(400);
      expect(respuesta.body.message).toContain('Escribe un correo válido');
    });
  });

  describe('clases y notas', () => {
    it('un profesor no puede ver las notas de una clase ajena', async () => {
      const ana = await login('ana.gomez@nexo.edu.co');
      // La clase 2 (Cálculo) es de Jorge Díaz
      await api
        .get('/api/clases/2/notas')
        .set('Authorization', `Bearer ${ana}`)
        .expect(403);
    });

    it('el profesor guarda notas en su clase', async () => {
      const ana = await login('ana.gomez@nexo.edu.co');
      const planilla = await api
        .get('/api/clases/1/notas')
        .set('Authorization', `Bearer ${ana}`)
        .expect(200);
      const final = planilla.body.evaluaciones[2]; // Examen final (40%), sin notas
      const fila = planilla.body.filas[0];

      const actualizada = await api
        .put('/api/clases/1/notas')
        .set('Authorization', `Bearer ${ana}`)
        .send({
          notas: [
            {
              evaluacionId: final.id,
              inscripcionId: fila.inscripcionId,
              valor: 5,
            },
          ],
        })
        .expect(200);
      const filaNueva = actualizada.body.filas.find(
        (f: { inscripcionId: number }) =>
          f.inscripcionId === fila.inscripcionId,
      );
      expect(filaNueva.porcentajeEvaluado).toBe(100);
      expect(filaNueva.estado).not.toBe('En curso');
    });

    it('no permite notas mayores a 5', async () => {
      const ana = await login('ana.gomez@nexo.edu.co');
      await api
        .put('/api/clases/1/notas')
        .set('Authorization', `Bearer ${ana}`)
        .send({ notas: [{ evaluacionId: 1, inscripcionId: 1, valor: 7 }] })
        .expect(400);
    });

    it('un estudiante no puede poner notas', async () => {
      const sofia = await login('sofia.martinez@nexo.edu.co');
      await api
        .get('/api/clases/1/notas')
        .set('Authorization', `Bearer ${sofia}`)
        .expect(403);
    });

    it('no deja inscribir una materia que se cruza de horario', async () => {
      const rector = await login('rector@nexo.edu.co');
      // Clase en el mismo horario que Programación I (lunes 07:00-09:00)
      const clase = await api
        .post('/api/clases')
        .set('Authorization', `Bearer ${rector}`)
        .send({
          asignaturaId: 4,
          profesorId: 3,
          dia: 'Lunes',
          horaInicio: '08:00',
          horaFin: '10:00',
          salon: 'X',
          cupo: 10,
        })
        .expect(201);

      const sofia = await login('sofia.martinez@nexo.edu.co');
      const respuesta = await api
        .post(`/api/clases/${clase.body.id}/inscripciones`)
        .set('Authorization', `Bearer ${sofia}`)
        .send({})
        .expect(409);
      expect(respuesta.body.message).toContain('Se cruza con Programación I');
    });
  });

  describe('reportes', () => {
    it('el estudiante ve su boletín pero no el de otros', async () => {
      const sofia = await login('sofia.martinez@nexo.edu.co');
      const perfil = await api
        .get('/api/auth/perfil')
        .set('Authorization', `Bearer ${sofia}`);
      await api
        .get(`/api/reportes/estudiantes/${perfil.body.id}`)
        .set('Authorization', `Bearer ${sofia}`)
        .expect(200);
      await api
        .get(`/api/reportes/estudiantes/${perfil.body.id + 1}`)
        .set('Authorization', `Bearer ${sofia}`)
        .expect(403);
    });

    it('el profesor genera el reporte de notas de su clase', async () => {
      const ana = await login('ana.gomez@nexo.edu.co');
      const reporte = await api
        .get('/api/reportes/clases/1')
        .set('Authorization', `Bearer ${ana}`)
        .expect(200);
      expect(reporte.body.resumen.estudiantes).toBe(5);
    });
  });
});
