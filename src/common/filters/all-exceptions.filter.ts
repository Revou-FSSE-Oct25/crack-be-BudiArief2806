// Filter ini menjadi fallback terakhir untuk menangkap error yang tidak
// ditangani secara spesifik oleh filter lain.
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

// Request dan Response dari Express dipakai agar kita bisa membaca request
// yang masuk dan mengirim response manual.
import { Request, Response } from 'express';

// @Catch() tanpa parameter berarti semua exception akan ditangkap oleh filter ini.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // Method catch() akan dipanggil otomatis ketika ada exception yang tertangkap.
  catch(exception: unknown, host: ArgumentsHost): void {
    // Ambil konteks HTTP dari ArgumentsHost.
    // NestJS mendukung beberapa jenis konteks (HTTP, RPC, WebSocket),
    // jadi kita perlu memilih konteks yang sedang dipakai.
    const context = host.switchToHttp();

    // Ambil object response agar kita bisa mengatur status code dan body JSON.
    const response = context.getResponse<Response>();

    // Ambil object request untuk mengetahui URL mana yang sedang diproses saat error.
    const request = context.getRequest<Request>();

    // Simpan error asli ke console server untuk kebutuhan debugging.
    // Client tidak diberi detail lengkap error supaya informasi internal server tidak bocor.
    console.error(exception);

    // Jika exception sebenarnya adalah HttpException,
    // kembalikan status dan message aslinya agar tidak berubah menjadi 500.
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      let message = exception.message;

      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        const maybeMessage = (body as { message?: string | string[] }).message;
        message = Array.isArray(maybeMessage)
          ? maybeMessage.join(', ')
          : maybeMessage ?? exception.message;
      }

      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // Kirim response 500 Internal Server Error dalam format JSON yang konsisten.
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      // Kode status HTTP yang dikirim ke client.
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,

      // Pesan umum untuk menandakan terjadi error di sisi server.
      message: 'Internal server error',

      // Waktu error terjadi dalam format ISO agar mudah dicatat dan dilacak.
      timestamp: new Date().toISOString(),

      // URL endpoint yang sedang diakses saat error terjadi.
      path: request.url,
    });
  }
}
