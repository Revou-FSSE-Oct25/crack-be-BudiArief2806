// Controller rumah sakit.
// Endpoint ini dipakai frontend untuk menampilkan pilihan rumah sakit.
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HospitalsService } from './hospitals.service';

@ApiTags('hospitals')
@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  // Mengembalikan seluruh daftar rumah sakit
  // dalam properti "items" agar konsisten dengan endpoint list lain.
  @Get()
  @ApiOperation({ summary: 'List all hospitals' })
  async findAll() {
    return { items: await this.hospitalsService.findAll() };
  }
}
