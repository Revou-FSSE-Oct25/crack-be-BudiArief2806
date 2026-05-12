// Service rumah sakit untuk mengambil daftar dan detail rumah sakit.
// Tempat ini cocok untuk aturan bisnis sebelum data dikirim ke controller.
import { Injectable, NotFoundException } from '@nestjs/common';
import { HospitalEntity } from './entities/hospital.entity';
import { HospitalsRepository } from './hospitals.repository';

@Injectable()
export class HospitalsService {
  constructor(private readonly hospitalsRepository: HospitalsRepository) {}

  findAll(): Promise<HospitalEntity[]> {
    return this.hospitalsRepository.findAll();
  }

  async findById(id: string): Promise<HospitalEntity> {
    const hospital = await this.hospitalsRepository.findById(id);
    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }

    return hospital;
  }
}
