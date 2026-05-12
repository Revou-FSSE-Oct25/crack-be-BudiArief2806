import { Injectable } from '@nestjs/common';
import { Specialty } from '../../common/enums/domain.enums';
import { PrismaService } from '../../prisma/prisma.service';
import { DoctorEntity } from './entities/doctor.entity';

@Injectable()
export class DoctorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(specialty?: Specialty): Promise<DoctorEntity[]> {
    const doctors = await this.prisma.doctor.findMany({
      where: specialty ? { specialty } : undefined,
      include: {
        hospital: true,
        roomAvailabilities: {
          include: {
            room: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
    });

    return doctors.map((doctor) => ({
      id: doctor.id,
      hospitalId: doctor.hospitalId,
      name: doctor.name,
      specialty: doctor.specialty as Specialty,
      // Availability dokter sekarang dihitung secara efektif:
      // dokter aktif secara global dan masih punya minimal satu ruangan yang siap untuk dirinya.
      available:
        doctor.available &&
        doctor.roomAvailabilities.some(
          (item) => item.available && item.room.available,
        ),
      hospitalName: doctor.hospital.name,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
    }));
  }

  async findById(id: string): Promise<DoctorEntity | null> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        hospital: true,
        roomAvailabilities: {
          include: {
            room: true,
          },
        },
      },
    });

    if (!doctor) {
      return null;
    }

    return {
      id: doctor.id,
      hospitalId: doctor.hospitalId,
      name: doctor.name,
      specialty: doctor.specialty as Specialty,
      // Detail dokter juga memakai availability efektif yang sama dengan list dokter.
      available:
        doctor.available &&
        doctor.roomAvailabilities.some(
          (item) => item.available && item.room.available,
        ),
      hospitalName: doctor.hospital.name,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
    };
  }

  async updateAvailability(
    id: string,
    available: boolean,
  ): Promise<DoctorEntity | null> {
    await this.prisma.doctor.update({
      where: { id },
      data: { available },
    });

    return this.findById(id);
  }
}
