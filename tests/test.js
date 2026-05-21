process.env.NODE_ENV = 'test';

const { describe, it, before, after, beforeEach } = require('node:test');
const { expect } = require('expect');

const request = require('supertest');
const { z } = require('zod');
const app = require('../src/app');
const { sequelize, User, Role, Career, Subject, Student, Registration, AcademicPeriod } = require('../src/models');
const { hashPassword } = require('../src/services/passwordService');

const beforeAll = before;
const afterAll = after;

// --- 1. SCHEMAS (ZOD) ---
const loginSchema = z.object({
  token_type: z.string(),
  access_token: z.string(),
  expires_in: z.string().or(z.number()),
  user: z.object({
    id_user: z.string().uuid(),
    username: z.string(),
    email: z.string().nullable().optional(),
    status: z.string(),
  }).passthrough(),
});

const usersListSchema = z.array(z.object({
  id_user: z.string().uuid(),
  username: z.string(),
}).passthrough());

const careerSchema = z.object({
  id_career: z.number().int(),
  code_career: z.string(),
  name_career: z.string(),
  total_semesters: z.number().int(),
  is_active: z.boolean(),
}).passthrough();

const subjectSchema = z.object({
  id_subject: z.number().int().optional(),
  name_subject: z.string().optional(),
}).passthrough();

const registrationSchema = z.object({
  id_registration: z.number().int().optional(),
  id_student: z.number().int().optional(),
}).passthrough();

// --- 2. FIXTURES ---
async function createTestRole() {
  return await Role.create({
    name_role: 'Admin',
    description: 'Administrador del sistema',
    is_active: true,
  });
}

async function createTestUser(roleId, override = {}) {
  return await User.create({
    id_role: roleId,
    document_id: override.document_id ?? `V-${override.username ?? 'testuser'}`,
    username: 'testuser',
    password_hash: hashPassword('password123'),
    name: 'Test',
    lastname: 'User',
    email: 'testuser@example.com',
    birth_date: '2000-01-01',
    status: 'Activo',
    ...override,
  });
}

async function createTestCareer() {
  return await Career.create({
    code_career: 'ING-SIS',
    name_career: 'Ingeniería de Sistemas',
    total_semesters: 10,
    is_active: true,
  });
}

async function createTestSubject() {
  return await Subject.create({
    code_subject: 'MAT-101',
    name_subject: 'Matemáticas I',
    credit_units: 4,
  });
}

async function createTestStudent(userId, careerId) {
  return await Student.create({
    id_user: userId,
    id_career: careerId,
    current_semester: 1,
    admission_date: new Date(),
    status: 'Regular',
  });
}

// --- 3. TESTS ---
describe('API Integration Tests (6 Endpoints)', () => {

  // SETUP: Sincronizar la base de datos de test
  beforeAll(async () => {
    // Asegurar que estamos en entorno de pruebas
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Estas pruebas solo deben correrse con NODE_ENV=test');
    }
    await sequelize.sync({ force: true });
  });

  // TEARDOWN: Cerrar la conexión
  afterAll(async () => {
    if (process.env.NODE_ENV === 'test') {
      await sequelize.close();
    }
  });

  describe('1 y 2. Auth & Users API', () => {
    let token;
    let role;

    beforeEach(async () => {
      await User.destroy({ where: {} });
      await Role.destroy({ where: {} });
      
      role = await createTestRole();
      await createTestUser(role.id_role, { username: 'user1', email: 'user1@test.com' });
      await createTestUser(role.id_role, { username: 'user2', email: 'user2@test.com' });
    });

    // Endpoint 1: POST /api/auth/login
    it('1. POST /api/auth/login - Autenticación correcta y Network Validation', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'user1', password: 'password123' });

      // Network Validation
      expect(res.status).toBe(200); 

      // Schema Validation
      const parsed = loginSchema.safeParse(res.body);
      expect(parsed.success).toBe(true);
      expect(res.body.access_token).toBeDefined();
      expect(res.body.user.username).toBe('user1');
      
      // Guardar token para las siguientes pruebas
      token = res.body.access_token;
    });

    // Endpoint 2: GET /api/users
    it('2. GET /api/users - Listar usuarios con Schema Validation', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      // Network Validation
      expect(res.status).toBe(200);
      
      // Schema Validation
      const parsed = usersListSchema.safeParse(res.body);
      expect(parsed.success).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('3 y 4. Careers API', () => {
    let token;
    let testCareer;

    beforeEach(async () => {
      await Career.destroy({ where: {} });
      await User.destroy({ where: {} });
      await Role.destroy({ where: {} });
      
      const role = await createTestRole();
      await createTestUser(role.id_role, { username: 'admin' });
      
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'password123' });
      token = loginRes.body.access_token;

      testCareer = await createTestCareer();
    });

    // Endpoint 3: POST /api/careers
    it('3. POST /api/careers - Debería crear una carrera', async () => {
      const newCareer = {
        code_career: 'ING-CIV',
        name_career: 'Ingeniería Civil',
        total_semesters: 10,
        is_active: true
      };

      const res = await request(app)
        .post('/api/careers')
        .set('Authorization', `Bearer ${token}`)
        .send(newCareer);

      expect(res.status).toBe(201); // Network Validation
      
      const parsed = careerSchema.safeParse(res.body); // Schema Validation
      expect(parsed.success).toBe(true);
      expect(res.body.name_career).toBe('Ingeniería Civil');
    });

    // Endpoint 4: GET /api/careers/:id
    it('4. GET /api/careers/:id - Debería obtener una carrera', async () => {
      const res = await request(app)
        .get(`/api/careers/${testCareer.id_career}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200); // Network Validation
      
      const parsed = careerSchema.safeParse(res.body); // Schema Validation
      expect(parsed.success).toBe(true);
      expect(res.body.id_career).toBe(testCareer.id_career);
    });
  });

  describe('5. Subjects API', () => {
    let token;
    let testSubject;

    beforeEach(async () => {
      await Subject.destroy({ where: {} });
      await User.destroy({ where: {} });
      await Role.destroy({ where: {} });

      const role = await createTestRole();
      await createTestUser(role.id_role, { username: 'admin2' });
      
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin2', password: 'password123' });
      token = loginRes.body.access_token;

      testSubject = await createTestSubject();
    });

    // Endpoint 5: PUT /api/subjects/:id
    it('5. PUT /api/subjects/:id - Debería actualizar una materia', async () => {
      const updateData = {
        code_subject: testSubject.code_subject,
        name_subject: 'Matemáticas Avanzadas',
        credit_units: 5
      };

      const res = await request(app)
        .put(`/api/subjects/${testSubject.id_subject}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200); // Network Validation
      
      const parsed = subjectSchema.safeParse(res.body); // Schema Validation
      expect(parsed.success).toBe(true);
      expect(res.body.name_subject).toBe('Matemáticas Avanzadas');
    });
  });

  describe('6. Registrations API', () => {
    let token;
    let testStudent;
    let testPeriod;

    beforeEach(async () => {
      await Registration.destroy({ where: {} });
      await Student.destroy({ where: {} });
      await AcademicPeriod.destroy({ where: {} });
      await Career.destroy({ where: {} });
      await User.destroy({ where: {} });
      await Role.destroy({ where: {} });

      const role = await createTestRole();
      const user = await createTestUser(role.id_role, { username: 'student1' });
      
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: 'student1', password: 'password123' });
      token = loginRes.body.access_token;

      const career = await createTestCareer();
      testStudent = await createTestStudent(user.id_user, career.id_career);

      testPeriod = await AcademicPeriod.create({
        name_period: '2026-I',
        start_date: new Date(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        enrollment_status: 'Abierta',
        period_status: 'Activo'
      });
    });

    // Endpoint 6: POST /api/registrations
    it('6. POST /api/registrations - Debería crear una matriculación', async () => {
      const newRegistration = {
        id_student: testStudent.id_student,
        id_period: testPeriod.id_period,
        status: 'Inscrito'
      };

      const res = await request(app)
        .post('/api/registrations')
        .set('Authorization', `Bearer ${token}`)
        .send(newRegistration);

      expect([200, 201]).toContain(res.status); // Network validation
      
      const parsed = registrationSchema.safeParse(res.body); // Schema Validation
      expect(parsed.success).toBe(true);
      expect(res.body.id_student).toBe(testStudent.id_student);
    });
  });
});
