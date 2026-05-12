// Filter untuk merapikan response error HTTP agar bentuknya konsisten.
// Filter ini khusus menangani error yang berasal dari class HttpException
// seperti BadRequestException, NotFoundException, UnauthorizedException, dll.
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    // Ambil status dari exception.
    // Jika tidak tersedia, fallback ke 500.
    const status = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;

    // Body bawaan exception bisa berupa string atau object.
    const body = exception.getResponse();

    let message = exception.message;

    // Jika body berbentuk string, gunakan langsung sebagai message.
    if (typeof body === 'string') {
      message = body;
    } else if (body && typeof body === 'object') {
      // Jika body object, Nest sering menyimpan pesan di properti "message".
      const maybeMessage = (body as { message?: string | string[] }).message;
      message = Array.isArray(maybeMessage)
        ? maybeMessage.join(', ')
        : maybeMessage ?? exception.message;
    }

    // Response error dibuat seragam agar frontend lebih mudah mengonsumsinya.
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
