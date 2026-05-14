# Diabstrok API Budi Arief 

Backend NestJS untuk sistem booking pasien Diabstrok dengan Prisma, JWT bearer token, Swagger, dan seed data lokal.

## Checklist yang tercakup

- Inisialisasi backend dan arsitektur folder modular
- Schema database untuk `users`, `hospitals`, `doctors`, `rooms`, `doctor_room_availabilities`, `bookings`, `prescriptions`, dan `doctor_reviews`
- Auth `register/login/me` berbasis JWT
- CRUD utama untuk resource booking
- Seed data untuk integrasi frontend, Swagger, dan Postman
- Validation pipe, guards, middleware logger, dan global exception filters
- E2E test backend dengan seeded sample data

## Stack

- NestJS : karena framework ini modular, terstruktur, dan sangat cocok untuk aplikasi backend yang memiliki banyak role, banyak endpoint, dan membutuhkan autentikasi JWT serta validasi data yang rapi.
- Prisma ORM : Prisma mempermudah pengelolaan database PostgreSQL, memberikan type safety di TypeScript, dan sangat membantu dalam membangun relasi data serta endpoint CRUD secara lebih cepat dan terstruktur.
- PostgreSQL dan Dbeaver untuk development dan deployment
  <img width="1407" height="798" alt="image" src="https://github.com/user-attachments/assets/45be7397-7c8d-4ba9-ac22-30ac53c44840" />
- JWT authentication (sebagai Bodyguard dirumah kita )
  <img width="632" height="237" alt="image" src="https://github.com/user-attachments/assets/91d1e1f3-f3da-473c-a86e-6e2354eed977" />
- Swagger di `/api`
- <img width="1915" height="374" alt="image" src="https://github.com/user-attachments/assets/9f1966ef-e639-482c-8b6e-db07c7437f02" />


## Struktur utama

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/modules/auth`
- `src/modules/users`
- `src/modules/hospitals`
- `src/modules/doctors`
- `src/modules/rooms`
- `src/modules/bookings`
- `src/common`
- `test/app.e2e-spec.ts`

## Menjalankan backend

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run start:dev
```

Server berjalan di `http://localhost:3001`.
Swagger tersedia di `http://localhost:3001/api`.

## Environment

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/diabstrok?schema=public"
JWT_SECRET="diabstrok-super-secret"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```


## Endpoint penting

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /hospitals`
- `GET /doctors`
- `PATCH /doctors/:id/availability`
- `GET /rooms`
- `PATCH /doctors/:doctorId/rooms/:roomId/availability`
- `PATCH /rooms/:id/availability`
- `POST /bookings`
- `GET /bookings/me`
- `GET /bookings`
- `GET /bookings/:id`
- `PATCH /bookings/:id`
- `PATCH /bookings/:id/status`
- `DELETE /bookings/:id`
- `POST /bookings/:id/prescription`
- `POST /bookings/:id/doctor-review`

## Testing

```bash
npm run build
npm run test
npm run test:e2e -- --runInBand
npm run test:cov
Dockerfile : deploy backend ke render
docker-compose.yml : cara menjalankan backend dan database bersama-sama
```

## Unit Testing dan Coverage

<img width="868" height="620" alt="image" src="https://github.com/user-attachments/assets/cd17936f-d964-46a7-ac4a-c05c0386696b" />

Snapshot coverage BE terbaru:

- Statements: `84.14%`
- Branches: `71.36%`
- Functions: `77.35%`
- Lines: `83.21%`

Scope coverage backend saat ini difokuskan pada unit yang paling penting untuk
keamanan, validasi, dan alur bisnis:

- `src/common/**/*`
- `src/modules/auth/**/*`
- `src/modules/bookings/bookings.controller.ts`
- `src/modules/bookings/bookings.service.ts`

## Deploy readiness

Project ini sudah disiapkan agar mudah dibawa ke cloud:

- `Dockerfile` tersedia untuk container build
- CORS membaca `FRONTEND_URL`
- Auth memakai JWT secret dari environment
- Port membaca `PORT`

Untuk production, arahkan `DATABASE_URL` ke instance PostgreSQL yang persisten.
=======
[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/rF-k97Bx)
>>>>>>> 4da661f43b239ee54785beb9f20a79719ee4f0d7

## Deploy Link FE : https://crack-fe-budiarief2806-2.onrender.com/
## Deploy Link Endpoint & BE: https://crack-be-budiarief2806-2.onrender.com/api#/bookings/BookingsController_update
## Deploy Link Dokter : https://crack-be-budiarief2806-2.onrender.com/doctors
## Deploy link hospital : https://crack-be-budiarief2806-2.onrender.com/hospitals
