// Service dokter untuk filter data dokter berdasarkan rumah sakit atau spesialis.
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Specialty } from '../../common/enums/domain.enums';
import { PrismaService } from '../../prisma/prisma.service';
import { DoctorEntity, DoctorView } from './entities/doctor.entity';
import { DoctorsRepository } from './doctors.repository';

@Injectable()
export class DoctorsService {
  constructor(
    private readonly doctorsRepository: DoctorsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(filters?: {
    hospitalId?: string;
    hospitalName?: string;
    specialty?: Specialty;
  }): Promise<DoctorView[]> {
    const doctors = await this.doctorsRepository.findAll(filters?.specialty);

    return doctors.filter((doctor) => {
      if (filters?.hospitalId && doctor.hospitalId !== filters.hospitalId) {
        return false;
      }

      if (
        filters?.hospitalName &&
        !this.isSameHospital(doctor.hospitalName, filters.hospitalName)
      ) {
        return false;
      }

      return true;
    });
  }

  async findById(id: string): Promise<DoctorView> {
    const doctor = await this.doctorsRepository.findById(id);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async updateAvailability(id: string, available: boolean): Promise<DoctorView> {
    await this.findById(id);

    const doctor = await this.doctorsRepository.updateAvailability(id, available);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async deleteDoctor(id: string): Promise<DoctorView> {
    const doctorView = await this.findById(id);
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (doctor._count.bookings > 0) {
      throw new ConflictException(
        'Doctor cannot be deleted while bookings still reference this doctor',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.doctor.delete({
        where: { id },
      });

      if (doctor.user?.id) {
        await tx.user.delete({
          where: { id: doctor.user.id },
        });
      }
    });

    return doctorView;
  }

  private isSameHospital(left: string, right: string): boolean {
    const leftCompact = this.compactValue(left);
    const rightCompact = this.compactValue(right);

    if (!leftCompact || !rightCompact) {
      return false;
    }

    if (
      leftCompact === rightCompact ||
      leftCompact.includes(rightCompact) ||
      rightCompact.includes(leftCompact)
    ) {
      return true;
    }

    const leftCore = this.removeHospitalPrefix(leftCompact);
    const rightCore = this.removeHospitalPrefix(rightCompact);

    if (
      leftCore === rightCore ||
      leftCore.includes(rightCore) ||
      rightCore.includes(leftCore)
    ) {
      return true;
    }

    const leftAcronym = this.buildAcronym(left);
    const rightAcronym = this.buildAcronym(right);

    return Boolean(
      (leftAcronym && rightCore.includes(leftAcronym)) ||
        (rightAcronym && leftCore.includes(rightAcronym)) ||
        (leftAcronym && rightAcronym && leftAcronym === rightAcronym),
    );
  }

  private compactValue(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  private removeHospitalPrefix(value: string): string {
    return value.replace(/^rs/, '');
  }

  private buildAcronym(value: string): string {
    return value
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .filter(Boolean)
      .filter((token) => token !== 'rs')
      .map((token) => token[0])
      .join('');
  }
}
