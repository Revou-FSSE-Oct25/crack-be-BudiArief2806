// Controller root sederhana untuk health check backend.
// Biasanya endpoint ini dipakai untuk memastikan server hidup
// tanpa harus mengakses endpoint bisnis yang lebih kompleks.
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  // Service di-inject lewat constructor agar controller hanya fokus menerima request
  // dan meneruskan pekerjaan ke layer service.
  constructor(private readonly appService: AppService) {}

  // GET / akan mengembalikan informasi dasar tentang backend.
  @Get()
  @ApiOperation({ summary: 'Health check for the Diabstrok API' })
  getHello() {
    return this.appService.getHello();
  }
}
