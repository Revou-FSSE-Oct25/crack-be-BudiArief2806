import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BookingStatus,
  DiseaseStage,
  Role,
  RoomType,
  Specialty,
} from '../../common/enums/domain.enums';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingEntity } from './entities/booking.entity';

@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      include: this.includeRelations(),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings.map((booking) => this.toBookingEntity(booking));
  }

  async findAllByUserId(userId: string): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: this.includeRelations(),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings.map((booking) => this.toBookingEntity(booking));
  }

  async findAllByDoctorId(doctorId: string): Promise<BookingEntity[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { doctorId },
      include: this.includeRelations(),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings.map((booking) => this.toBookingEntity(booking));
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: this.includeRelations(),
    });

    return booking ? this.toBookingEntity(booking) : null;
  }

  async create(booking: {
    userId?: string | null;
    patientName: string;
    patientAge?: number | null;
    hospitalId: string;
    doctorId: string;
    roomId: string;
    complaint: string;
    status: BookingStatus;
    queueNumber: number;
    etaMinutes: number;
  }): Promise<BookingEntity> {
    const created = await this.prisma.booking.create({
      data: booking,
    });

    return this.getRequiredById(created.id);
  }

  async update(
    id: string,
    payload: Partial<{
      hospitalId: string;
      doctorId: string;
      roomId: string;
      complaint: string;
      status: BookingStatus;
      queueNumber: number;
      etaMinutes: number;
    }>,
  ): Promise<BookingEntity> {
    await this.prisma.booking.update({
      where: { id },
      data: payload,
    });

    return this.getRequiredById(id);
  }

  async updateStatus(id: string, status: BookingStatus): Promise<BookingEntity> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.booking.delete({
      where: { id },
    });
  }

  countActiveByHospitalId(hospitalId: string): Promise<number> {
    return this.prisma.booking.count({
      where: {
        hospitalId,
        status: {
          in: [
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.REVIEWED_BY_DOCTOR,
          ],
        },
      },
    });
  }

  async upsertPrescription(payload: {
    bookingId: string;
    stage: DiseaseStage;
    itemsJson: string;
    notes?: string;
    createdByUserId: string;
  }): Promise<BookingEntity> {
    await this.prisma.prescription.upsert({
      where: {
        bookingId: payload.bookingId,
      },
      update: {
        stage: payload.stage,
        itemsJson: payload.itemsJson,
        notes: payload.notes,
        createdByUserId: payload.createdByUserId,
      },
      create: payload,
    });

    return this.getRequiredById(payload.bookingId);
  }

  async upsertDoctorReview(payload: {
    bookingId: string;
    symptoms: string;
    diagnosis: string;
    estimatedCost: number;
    healthAdvice: string;
    stage: DiseaseStage;
    itemsJson: string;
    notes: string;
    createdByUserId: string;
  }): Promise<BookingEntity> {
    await this.prisma.$transaction([
      this.prisma.doctorReview.upsert({
        where: {
          bookingId: payload.bookingId,
        },
        update: {
          symptoms: payload.symptoms,
          diagnosis: payload.diagnosis,
          estimatedCost: payload.estimatedCost,
          healthAdvice: payload.healthAdvice,
          createdByUserId: payload.createdByUserId,
        },
        create: {
          bookingId: payload.bookingId,
          symptoms: payload.symptoms,
          diagnosis: payload.diagnosis,
          estimatedCost: payload.estimatedCost,
          healthAdvice: payload.healthAdvice,
          createdByUserId: payload.createdByUserId,
        },
      }),
      this.prisma.prescription.upsert({
        where: {
          bookingId: payload.bookingId,
        },
        update: {
          stage: payload.stage,
          itemsJson: payload.itemsJson,
          notes: payload.notes,
          createdByUserId: payload.createdByUserId,
        },
        create: {
          bookingId: payload.bookingId,
          stage: payload.stage,
          itemsJson: payload.itemsJson,
          notes: payload.notes,
          createdByUserId: payload.createdByUserId,
        },
      }),
      this.prisma.booking.update({
        where: { id: payload.bookingId },
        data: {
          status: BookingStatus.REVIEWED_BY_DOCTOR,
        },
      }),
    ]);

    return this.getRequiredById(payload.bookingId);
  }

  private async getRequiredById(id: string): Promise<BookingEntity> {
    const booking = await this.findById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  private includeRelations() {
    return {
      user: true,
      doctor: true,
      hospital: true,
      room: true,
      prescription: {
        include: {
          createdByUser: true,
        },
      },
      doctorReview: {
        include: {
          createdByUser: true,
        },
      },
    } as const;
  }

  private toBookingEntity(booking: {
    id: string;
    userId: string | null;
    patientName: string;
    patientAge: number | null;
    hospitalId: string;
    doctorId: string;
    roomId: string;
    complaint: string;
    status: string;
    queueNumber: number;
    etaMinutes: number;
    createdAt: Date;
    updatedAt: Date;
    user: { id: string; name: string; email: string } | null;
    doctor: { id: string; name: string; specialty: string; hospitalId: string };
    hospital: { id: string; name: string };
    room: { id: string; name: string; type: string; available: boolean };
    prescription: {
      stage: string;
      itemsJson: string;
      notes: string | null;
      createdAt: Date;
      createdByUser: {
        role: string;
      };
    } | null;
    doctorReview: {
      symptoms: string;
      diagnosis: string;
      estimatedCost: number;
      healthAdvice: string;
      createdAt: Date;
      updatedAt: Date;
      createdByUser: {
        role: string;
      };
    } | null;
  }): BookingEntity {
    return {
      id: booking.id,
      userId: booking.userId,
      patientName: booking.patientName,
      patientAge: booking.patientAge,
      hospitalId: booking.hospitalId,
      doctorId: booking.doctorId,
      roomId: booking.roomId,
      complaint: booking.complaint,
      status: booking.status as BookingStatus,
      queueNumber: booking.queueNumber,
      etaMinutes: booking.etaMinutes,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      user: booking.user ?? undefined,
      doctor: {
        ...booking.doctor,
        specialty: booking.doctor.specialty as Specialty,
      },
      hospital: booking.hospital,
      room: {
        ...booking.room,
        type: booking.room.type as RoomType,
      },
      prescription: booking.prescription
        ? {
            stage: booking.prescription.stage as DiseaseStage,
            items: JSON.parse(booking.prescription.itemsJson) as string[],
            notes: booking.prescription.notes ?? '',
            createdAt: booking.prescription.createdAt.toISOString(),
            createdBy:
              booking.prescription.createdByUser.role === Role.DOCTOR
                ? 'doctor'
                : 'admin',
          }
        : undefined,
      doctorReview: booking.doctorReview
        ? {
            symptoms: booking.doctorReview.symptoms,
            diagnosis: booking.doctorReview.diagnosis,
            estimatedCost: booking.doctorReview.estimatedCost,
            healthAdvice: booking.doctorReview.healthAdvice,
            createdAt: booking.doctorReview.createdAt.toISOString(),
            updatedAt: booking.doctorReview.updatedAt.toISOString(),
            createdBy: 'doctor',
          }
        : undefined,
    };
  }
}
