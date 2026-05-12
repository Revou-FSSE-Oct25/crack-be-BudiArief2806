// Middleware logging request.
// Middleware berjalan sebelum request selesai diproses
// dan cocok untuk kebutuhan umum seperti logging.
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    // Simpan waktu mulai agar durasi request bisa dihitung saat response selesai.
    const startedAt = Date.now();

    // Event "finish" dipicu ketika response benar-benar sudah dikirim ke client.
    response.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      console.log(
        `[${request.method}] ${request.originalUrl} ${response.statusCode} - ${durationMs}ms`,
      );
    });

    // next() wajib dipanggil agar request lanjut ke middleware/handler berikutnya.
    next();
  }
}
