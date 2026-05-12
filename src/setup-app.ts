// Setup global backend.
// File ini memusatkan konfigurasi aplikasi agar main.ts tetap ringkas
// dan semua pengaturan global mudah ditemukan di satu tempat.
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

export function setupApp(app: INestApplication): void {
  const corsOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  // Mengizinkan frontend lokal mengakses backend beserta cookie/credential jika diperlukan.
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // ValidationPipe global akan otomatis memvalidasi DTO pada semua endpoint.
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true membuang properti yang tidak didefinisikan di DTO.
      whitelist: true,

      // forbidNonWhitelisted: true akan melempar error jika client mengirim field asing.
      forbidNonWhitelisted: true,

      // transform: true mengubah payload ke tipe DTO yang sesuai.
      transform: true,
    }),
  );

  // Pasang dua filter global:
  // 1. HttpExceptionFilter untuk error HTTP yang sengaja dilempar aplikasi.
  // 2. AllExceptionsFilter untuk error tak terduga sebagai fallback.
  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  // Konfigurasi dasar dokumentasi Swagger/OpenAPI.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Diabstrok API')
    .setDescription('Backend NestJS for auth, bookings, hospitals, doctors, and rooms.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  // Generate dokumen OpenAPI dari seluruh controller dan decorator Swagger.
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Dokumentasi akan tersedia di endpoint /api.
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      // Simpan token authorization di UI Swagger agar tidak perlu isi ulang terus.
      persistAuthorization: true,
    },
  });
}
