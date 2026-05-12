import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  Role,
  RoomType,
  Specialty,
} from '../src/common/enums/domain.enums';
import { hashPassword } from '../src/common/security/password.util';
import { AppModule } from '../src/app.module';
import { createPrismaAdapter } from '../src/prisma/prisma.adapter';
import { setupApp } from '../src/setup-app';

type SwaggerDocumentResponse = {
  info: {
    title: string;
  };
  paths: Record<string, unknown>;
};

describe('Diabstrok API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Test memakai adapter PostgreSQL yang sama dengan runtime backend.
    prisma = new PrismaClient({
      adapter: createPrismaAdapter(),
    });

    await prisma.$connect();
    await prisma.doctorRoomAvailability.deleteMany();
    await prisma.doctorReview.deleteMany();
    await prisma.prescription.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.room.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.hospital.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.create({
      data: {
        name: 'Admin Diabstrok',
        email: 'admin@diabstrok.id',
        password: await hashPassword('admin1234'),
        role: Role.ADMIN,
      },
    });

    await prisma.user.create({
      data: {
        name: 'Rina Diabstrok',
        email: 'rina@diabstrok.id',
        password: await hashPassword('user1234'),
        role: Role.USER,
      },
    });

    const doctorUser = await prisma.user.create({
      data: {
        name: 'dr. Siti Rahma',
        email: 'siti@diabstrok.id',
        password: await hashPassword('doctor1234'),
        role: Role.DOCTOR,
      },
    });

    await prisma.hospital.create({
      data: {
        id: 'thb',
        name: 'RS Taman Harapan Baru',
        lat: -6.1978,
        lng: 107.0024,
      },
    });

    await prisma.doctor.create({
      data: {
        id: 'd2',
        hospitalId: 'thb',
        userId: doctorUser.id,
        name: 'dr. Siti Rahma',
        specialty: Specialty.DIABETES,
        available: true,
      },
    });

    await prisma.room.create({
      data: {
        id: 'r1',
        hospitalId: 'thb',
        name: 'VIP 01',
        type: RoomType.VIP,
        available: true,
      },
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({
        name: 'Diabstrok API',
        status: 'ok',
        docs: '/api',
      });
  });

  it('/auth/login (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@diabstrok.id',
        password: 'admin1234',
      })
      .expect(201);

    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.tokenType).toBe('Bearer');
    expect(response.body.user.email).toBe('admin@diabstrok.id');
  });

  it('/hospitals (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/hospitals')
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].id).toBe('thb');
  });

  it('/api-json (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api-json')
      .expect(200);
    const body = response.body as SwaggerDocumentResponse;

    expect(body.info.title).toBe('Diabstrok API');
    expect(body.paths['/auth/login']).toBeDefined();
    expect(body.paths['/bookings']).toBeDefined();
  });
});
