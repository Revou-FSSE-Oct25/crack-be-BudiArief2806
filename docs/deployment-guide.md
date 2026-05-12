# Backend Deployment Guide

Panduan ini menyiapkan backend Diabstrok untuk deploy ke cloud service yang mendukung Docker seperti Render, Railway, Fly.io, atau platform serupa.

## Prasyarat

- Repository sudah berisi `Dockerfile`
- Environment production sudah disiapkan
- Frontend URL production sudah diketahui

## Environment minimum

```bash
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>?schema=public
JWT_SECRET=<strong-secret>
PORT=3001
FRONTEND_URL=https://your-frontend-domain.example
```

## Langkah umum

1. Push repository ke Git provider.
2. Buat service baru berbasis Docker.
3. Arahkan build ke folder `backend-diabstrok`.
4. Set environment variables production.
5. Deploy service dan catat public base URL.
6. Buka `/api` untuk memastikan Swagger tersedia.
7. Update frontend `NEXT_PUBLIC_API_BASE_URL` ke public backend URL.

## Verifikasi setelah deploy

1. `GET /`
2. `POST /auth/login`
3. `GET /hospitals`
4. `GET /doctors`
5. `GET /rooms`
6. `POST /bookings`
7. `GET /bookings/me`

## Catatan

- PostgreSQL dipakai baik untuk development maupun production.
- Jika memakai lebih dari satu frontend domain, isi `FRONTEND_URL` dengan daftar origin dipisah koma.
