// Service booking.
// Alur utama business logic booking, status, hak akses, dan resep diproses di sini.
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Role } from '../../common/enums/domain.enums';
import { HospitalEntity } from '../hospitals/entities/hospital.entity';
import { RoomEntity } from '../rooms/entities/room.entity';
import { PublicUser } from '../users/entities/user.entity';
import { DoctorsService } from '../doctors/doctors.service';
import { HospitalsService } from '../hospitals/hospitals.service';
import { RoomsService } from '../rooms/rooms.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateBookingMessageDto } from './dto/create-booking-message.dto';
import { CreateDoctorReviewDto } from './dto/create-doctor-review.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingsRepository } from './bookings.repository';
import { BookingEntity } from './entities/booking.entity';
import { RealtimeGateway } from '../../realtime/realtime.gateway';

@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly hospitalsService: HospitalsService,
    private readonly doctorsService: DoctorsService,
    private readonly roomsService: RoomsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async create(user: PublicUser, dto: CreateBookingDto) {
    const hospital = await this.hospitalsService.findById(dto.hospitalId);
    const doctor = await this.doctorsService.findById(dto.doctorId);
    const room = await this.roomsService.findByDoctorAndRoomId(
      dto.doctorId,
      dto.roomId,
    );

    if (doctor.hospitalId !== hospital.id) {
      throw new ForbiddenException('Doctor does not belong to the selected hospital');
    }

    if (room.hospitalId !== hospital.id) {
      throw new ForbiddenException('Room does not belong to the selected hospital');
    }

    if (!doctor.available) {
      throw new ForbiddenException('Doctor is not available');
    }

    if (!room.available) {
      throw new ForbiddenException('Room is not available');
    }

    const queueNumber =
      (await this.bookingsRepository.countActiveByHospitalId(hospital.id)) + 1;
    const etaMinutes = Math.max(8, Math.min(180, queueNumber * 12));
    const isAdminWalkIn = user.role === Role.ADMIN;
    const patientName = isAdminWalkIn
      ? dto.patientName?.trim()
      : user.name.trim();
    const patientAge = isAdminWalkIn ? dto.patientAge ?? null : null;

    if (isAdminWalkIn && !patientName) {
      throw new BadRequestException(
        'Patient name is required when admin creates a walk-in booking',
      );
    }

    if (isAdminWalkIn && patientAge == null) {
      throw new BadRequestException(
        'Patient age is required when admin creates a walk-in booking',
      );
    }

    const booking = await this.bookingsRepository.create({
      userId: isAdminWalkIn ? null : user.id,
      patientName: patientName ?? user.name.trim(),
      patientAge,
      hospitalId: hospital.id,
      doctorId: doctor.id,
      roomId: room.id,
      complaint: dto.complaint.trim(),
      status: BookingStatus.PENDING,
      queueNumber,
      etaMinutes,
    });

    const bookingView = this.toBookingView(booking, {
      hospital,
      room,
      queueNumber,
      etaMinutes,
    });

    this.realtimeGateway.broadcastBookingUpdated(bookingView, 'created');

    return {
      item: bookingView,
    };
  }

  async findMine(user: PublicUser) {
    const bookings = await this.bookingsRepository.findAllByUserId(user.id);
    return {
      items: bookings.map((booking) => this.toBookingView(booking)),
    };
  }

  async findAll(user: PublicUser) {
    if (user.role === Role.ADMIN) {
      const bookings = await this.bookingsRepository.findAll();
      return { items: bookings.map((booking) => this.toBookingView(booking)) };
    }

    if (user.role === Role.DOCTOR) {
      const doctorId = this.getDoctorIdOrThrow(user);
      const bookings = await this.bookingsRepository.findAllByDoctorId(doctorId);
      return { items: bookings.map((booking) => this.toBookingView(booking)) };
    }

    throw new ForbiddenException('Admin or doctor access is required');
  }

  async findAssignedToDoctor(user: PublicUser) {
    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException('Doctor access is required');
    }

    const doctorId = this.getDoctorIdOrThrow(user);
    const bookings = await this.bookingsRepository.findAllByDoctorId(doctorId);
    return { items: bookings.map((booking) => this.toBookingView(booking)) };
  }

  async findOne(id: string, user: PublicUser) {
    const booking = await this.getBookingOrThrow(id);
    this.assertAccess(booking, user);
    return { item: this.toBookingView(booking) };
  }

  async findMessages(id: string, user: PublicUser) {
    const booking = await this.getBookingOrThrow(id);
    this.assertAccess(booking, user);

    const messages = await this.bookingsRepository.findMessagesByBookingId(id);
    return { items: messages };
  }

  async update(id: string, user: PublicUser, dto: UpdateBookingDto) {
    const currentBooking = await this.getBookingOrThrow(id);
    this.assertAccess(currentBooking, user);

    if (user.role === Role.DOCTOR) {
      throw new ForbiddenException('Doctor cannot update booking from this endpoint');
    }

    if (dto.status && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Admin access is required to change booking status');
    }

    const hospital = await this.hospitalsService.findById(
      dto.hospitalId ?? currentBooking.hospitalId,
    );
    const doctor = await this.doctorsService.findById(
      dto.doctorId ?? currentBooking.doctorId,
    );
    const nextDoctorId = dto.doctorId ?? currentBooking.doctorId;
    const room = await this.roomsService.findByDoctorAndRoomId(
      nextDoctorId,
      dto.roomId ?? currentBooking.roomId,
    );

    if (doctor.hospitalId !== hospital.id) {
      throw new ForbiddenException('Doctor does not belong to the selected hospital');
    }

    if (room.hospitalId !== hospital.id) {
      throw new ForbiddenException('Room does not belong to the selected hospital');
    }

    if (!doctor.available) {
      throw new ForbiddenException('Doctor is not available');
    }

    if (!room.available) {
      throw new ForbiddenException('Room is not available');
    }

    const queueNumber =
      currentBooking.hospitalId === hospital.id
        ? currentBooking.queueNumber
        : (await this.bookingsRepository.countActiveByHospitalId(hospital.id)) + 1;
    const etaMinutes = Math.max(8, Math.min(180, queueNumber * 12));

    const booking = await this.bookingsRepository.update(id, {
      hospitalId: hospital.id,
      doctorId: doctor.id,
      roomId: room.id,
      complaint: dto.complaint?.trim() ?? currentBooking.complaint,
      status: dto.status ?? currentBooking.status,
      queueNumber,
      etaMinutes,
    });

    const bookingView = this.toBookingView(booking);
    this.realtimeGateway.broadcastBookingUpdated(
      bookingView,
      dto.status ? 'status_changed' : 'updated',
    );

    return { item: bookingView };
  }

  async createMessage(
    id: string,
    user: PublicUser,
    dto: CreateBookingMessageDto,
  ) {
    const booking = await this.getBookingOrThrow(id);
    this.assertAccess(booking, user);
    const trimmedMessage = dto.message.trim();

    if (!trimmedMessage) {
      throw new BadRequestException('Message cannot be empty');
    }

    const message = await this.bookingsRepository.createMessage({
      bookingId: booking.id,
      senderUserId: user.id,
      message: trimmedMessage,
    });

    this.realtimeGateway.broadcastBookingMessage({
      booking: this.toBookingView(booking),
      message,
    });

    return { item: message };
  }

  async updateStatus(id: string, user: PublicUser, dto: UpdateBookingStatusDto) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Admin access is required to change booking status');
    }

    return this.update(id, user, { status: dto.status });
  }

  async delete(id: string, user: PublicUser) {
    const booking = await this.getBookingOrThrow(id);
    this.assertAccess(booking, user);

    await this.bookingsRepository.delete(id);
    this.realtimeGateway.broadcastBookingDeleted({
      bookingId: booking.id,
      userId: booking.userId,
      doctorId: booking.doctorId,
    });
    return { ok: true };
  }

  async createPrescription(
    id: string,
    user: PublicUser,
    dto: CreatePrescriptionDto,
  ) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Admin access is required');
    }

    await this.getBookingOrThrow(id);

    const booking = await this.bookingsRepository.upsertPrescription({
      bookingId: id,
      stage: dto.stage,
      itemsJson: JSON.stringify(dto.items),
      notes: dto.notes?.trim(),
      createdByUserId: user.id,
    });

    const bookingView = this.toBookingView(booking);
    this.realtimeGateway.broadcastBookingUpdated(bookingView, 'prescription_saved');

    return { item: bookingView };
  }

  async submitDoctorReview(
    id: string,
    user: PublicUser,
    dto: CreateDoctorReviewDto,
  ) {
    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException('Doctor access is required');
    }

    const doctorId = this.getDoctorIdOrThrow(user);
    const booking = await this.getBookingOrThrow(id);

    if (booking.doctorId !== doctorId) {
      throw new ForbiddenException('This booking is not assigned to the current doctor');
    }

    if (
      booking.status !== BookingStatus.CONFIRMED &&
      booking.status !== BookingStatus.REVIEWED_BY_DOCTOR
    ) {
      throw new ForbiddenException(
        'Booking must be confirmed by admin before doctor review can be submitted',
      );
    }

    const updatedBooking = await this.bookingsRepository.upsertDoctorReview({
      bookingId: id,
      symptoms: dto.symptoms.trim(),
      diagnosis: dto.diagnosis.trim(),
      estimatedCost: dto.estimatedCost,
      healthAdvice: dto.healthAdvice.trim(),
      stage: dto.stage,
      itemsJson: JSON.stringify(dto.items.map((item) => item.trim())),
      notes: dto.notes.trim(),
      createdByUserId: user.id,
    });

    const bookingView = this.toBookingView(updatedBooking);
    this.realtimeGateway.broadcastBookingUpdated(
      bookingView,
      'doctor_review_submitted',
    );

    return { item: bookingView };
  }

  private async getBookingOrThrow(id: string): Promise<BookingEntity> {
    const booking = await this.bookingsRepository.findById(id);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  private assertAccess(booking: BookingEntity, user: PublicUser): void {
    if (user.role === Role.ADMIN) {
      return;
    }

    if (user.role === Role.DOCTOR) {
      const doctorId = this.getDoctorIdOrThrow(user);
      if (booking.doctorId === doctorId) {
        return;
      }

      throw new ForbiddenException('You do not have access to this booking');
    }

    if (booking.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this booking');
    }
  }

  private getDoctorIdOrThrow(user: PublicUser): string {
    if (!user.doctorId) {
      throw new ForbiddenException('Doctor account is not linked to a doctor profile');
    }

    return user.doctorId;
  }

  private toBookingView(
    booking: BookingEntity,
    extras?: {
      hospital?: HospitalEntity;
      room?: RoomEntity;
      queueNumber?: number;
      etaMinutes?: number;
    },
  ): BookingEntity {
    const createdAt =
      booking.createdAt instanceof Date
        ? booking.createdAt.toISOString()
        : booking.createdAt;
    const updatedAt =
      booking.updatedAt instanceof Date
        ? booking.updatedAt.toISOString()
        : booking.updatedAt;

    return {
      ...booking,
      createdAt,
      updatedAt,
      user: undefined,
      doctor: undefined,
      hospital: undefined,
      room: undefined,
      doctorName: booking.doctor?.name ?? booking.doctorName,
      specialty: booking.doctor?.specialty ?? booking.specialty,
      hospitalId: extras?.hospital?.id ?? booking.hospital?.id ?? booking.hospitalId,
      hospitalName: extras?.hospital?.name ?? booking.hospital?.name ?? booking.hospitalName,
      roomId: extras?.room?.id ?? booking.roomId,
      roomName: extras?.room?.name ?? booking.roomName,
      roomType: extras?.room?.type ?? booking.roomType,
      patientName: booking.patientName?.trim() || booking.user?.name?.trim() || booking.userName?.trim() || '-',
      patientAge: booking.patientAge ?? null,
      queueNumber: extras?.queueNumber ?? booking.queueNumber,
      etaMinutes: extras?.etaMinutes ?? booking.etaMinutes,
      userName:
        booking.patientName?.trim() ||
        booking.user?.name?.trim() ||
        booking.userName?.trim() ||
        '-',
      userEmail: booking.user?.email?.trim() ?? booking.userEmail?.trim() ?? '',
    };
  }
}
