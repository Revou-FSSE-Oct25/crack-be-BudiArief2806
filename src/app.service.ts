// Service root untuk response health check dan informasi dasar backend.
// Service ini sederhana karena tugasnya hanya menyediakan data statis
// yang dipakai oleh AppController.
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Method ini mengembalikan object status backend.
  // Format object seperti ini nyaman dipakai frontend, monitoring,
  // atau pengecekan manual via browser/Postman.
  getHello() {
    return {
      name: 'Diabstrok API',
      status: 'ok',
      docs: '/api',
    };
  }
}
