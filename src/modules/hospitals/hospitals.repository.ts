import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HospitalEntity } from './entities/hospital.entity';

@Injectable()
export class HospitalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<HospitalEntity[]> {
    return this.prisma.hospital.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  findById(id: string): Promise<HospitalEntity | null> {
    return this.prisma.hospital.findUnique({
      where: { id },
    });
  }
}
