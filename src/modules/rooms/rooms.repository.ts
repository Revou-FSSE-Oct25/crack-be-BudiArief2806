import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoomEntity } from './entities/room.entity';

@Injectable()
export class RoomsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Jika doctorId dikirim, backend menghitung availability efektif
  // dari kombinasi availability global ruangan dan availability khusus dokter.
  async findAll(filters?: {
    hospitalId?: string;
    doctorId?: string;
  }): Promise<RoomEntity[]> {
    if (filters?.doctorId) {
      const rooms = await this.prisma.room.findMany({
        where: filters?.hospitalId ? { hospitalId: filters.hospitalId } : undefined,
        include: {
          doctorAvailabilities: {
            where: {
              doctorId: filters.doctorId,
            },
          },
        },
        orderBy: [{ hospitalId: 'asc' }, { name: 'asc' }],
      });

      return rooms.map((room) => {
        const doctorAvailability = room.doctorAvailabilities[0];

        return {
          id: room.id,
          hospitalId: room.hospitalId,
          doctorId: filters.doctorId,
          name: room.name,
          type: room.type as RoomEntity['type'],
          available: room.available && (doctorAvailability?.available ?? true),
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        };
      });
    }

    const rooms = await this.prisma.room.findMany({
      where: filters?.hospitalId ? { hospitalId: filters.hospitalId } : undefined,
      orderBy: [{ hospitalId: 'asc' }, { name: 'asc' }],
    });

    return rooms.map((room) => ({
      id: room.id,
      hospitalId: room.hospitalId,
      name: room.name,
      type: room.type as RoomEntity['type'],
      available: room.available,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    }));
  }

  findById(id: string): Promise<RoomEntity | null> {
    return this.prisma.room.findUnique({
      where: { id },
    }) as Promise<RoomEntity | null>;
  }

  async updateAvailability(id: string, available: boolean): Promise<RoomEntity | null> {
    await this.prisma.room.update({
      where: { id },
      data: { available },
    });

    return this.findById(id);
  }

  async findByDoctorAndRoomId(
    doctorId: string,
    roomId: string,
  ): Promise<RoomEntity | null> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        doctorAvailabilities: {
          where: { doctorId },
        },
      },
    });

    if (!room) {
      return null;
    }

    const doctorAvailability = room.doctorAvailabilities[0];

    return {
      id: room.id,
      hospitalId: room.hospitalId,
      doctorId,
      name: room.name,
      type: room.type as RoomEntity['type'],
      available: room.available && (doctorAvailability?.available ?? true),
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }

  async upsertDoctorAvailability(
    doctorId: string,
    roomId: string,
    available: boolean,
  ): Promise<RoomEntity | null> {
    await this.prisma.doctorRoomAvailability.upsert({
      where: {
        doctorId_roomId: {
          doctorId,
          roomId,
        },
      },
      update: {
        available,
      },
      create: {
        doctorId,
        roomId,
        available,
      },
    });

    return this.findByDoctorAndRoomId(doctorId, roomId);
  }
}
