// Service ruangan untuk mengambil daftar ruangan yang dipakai saat booking.
import { Injectable, NotFoundException } from '@nestjs/common';
import { DoctorsService } from '../doctors/doctors.service';
import { RoomEntity } from './entities/room.entity';
import { RoomsRepository } from './rooms.repository';

@Injectable()
export class RoomsService {
  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly doctorsService: DoctorsService,
  ) {}

  async findAll(filters?: {
    hospitalId?: string;
    doctorId?: string;
  }): Promise<RoomEntity[]> {
    // Jika doctorId dikirim, availability yang dikembalikan
    // akan menjadi availability efektif untuk dokter tersebut.
    return this.roomsRepository.findAll(filters);
  }

  async findById(id: string): Promise<RoomEntity> {
    const room = await this.roomsRepository.findById(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async updateAvailability(id: string, available: boolean): Promise<RoomEntity> {
    await this.findById(id);

    const room = await this.roomsRepository.updateAvailability(id, available);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async findByDoctorAndRoomId(
    doctorId: string,
    roomId: string,
  ): Promise<RoomEntity> {
    const room = await this.roomsRepository.findByDoctorAndRoomId(doctorId, roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async updateAvailabilityForDoctor(
    doctorId: string,
    roomId: string,
    available: boolean,
  ): Promise<RoomEntity> {
    // Pastikan doctor dan room benar-benar ada
    // sebelum membuat availability khusus kombinasi keduanya.
    const doctor = await this.doctorsService.findById(doctorId);
    const room = await this.findById(roomId);

    if (doctor.hospitalId !== room.hospitalId) {
      throw new NotFoundException('Room is not registered for the selected doctor hospital');
    }

    const updatedRoom = await this.roomsRepository.upsertDoctorAvailability(
      doctorId,
      roomId,
      available,
    );

    if (!updatedRoom) {
      throw new NotFoundException('Room not found');
    }

    return updatedRoom;
  }
}
