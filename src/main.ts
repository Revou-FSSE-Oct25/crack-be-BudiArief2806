// main.ts adalah entry point aplikasi NestJS.
// Saat project dijalankan, file inilah yang pertama kali dieksekusi.
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';

// Root module yang berisi susunan utama aplikasi.
import { AppModule } from './app.module';

// Function helper untuk memasang konfigurasi global aplikasi.
import { setupApp } from './setup-app';

// bootstrap adalah function startup utama.
// Karena ada proses asynchronous seperti membuat app dan menyalakan server,
// function ini dibuat async.
async function bootstrap() {
  // Membuat instance aplikasi Nest berdasarkan AppModule.
  const app = await NestFactory.create(AppModule);

  // Memasang konfigurasi global seperti CORS, validation, filter, dan Swagger.
  setupApp(app);

  // Menjalankan server HTTP.
  // Jika environment variable PORT tersedia, nilainya dipakai.
  // Jika tidak, fallback ke port 3001.
  await app.listen(process.env.PORT ?? 3001);
}

// Menjalankan function bootstrap.
// Penulisan void di depan pemanggilan ini menunjukkan bahwa Promise hasil bootstrap
// memang sengaja tidak disimpan atau diproses lebih lanjut di sini.
void bootstrap();
