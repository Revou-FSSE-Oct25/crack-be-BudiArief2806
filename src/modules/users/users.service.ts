// Service user.
// Layer ini menangani aturan bisnis user dan sekarang langsung ke database (PostgreSQL).
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../../common/enums/domain.enums';
import { hashPassword } from '../../common/security/password.util';
import { PrismaService } from '../../prisma/prisma.service';
import { PublicUser, UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findEntityById(id: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        doctorProfile: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async findEntityByEmail(email: string): Promise<UserEntity | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        doctorProfile: {
          select: { id: true },
        },
      },
    });

    return user ? this.sanitizeUser(user) : null;
  }

  // Membuat user baru dan simpan ke database.
  async createUser(payload: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }): Promise<PublicUser> {
    const normalizedEmail = payload.email.trim().toLowerCase();

    const exists = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.prisma.user.create({
      data: {
        name: payload.name.trim(),
        email: normalizedEmail,
        password: await hashPassword(payload.password.trim()),
        role: payload.role ?? Role.USER,
      },
    });

    return this.toPublicUser(this.sanitizeUser(user));
  }

  toPublicUser(user: UserEntity): PublicUser {
    const sanitizedUser = this.sanitizeUser(user);

    return {
      id: sanitizedUser.id,
      name: sanitizedUser.name,
      email: sanitizedUser.email,
      role: sanitizedUser.role,
      doctorId: sanitizedUser.doctorId,
      createdAt: sanitizedUser.createdAt,
      updatedAt: sanitizedUser.updatedAt,
    };
  }

  private sanitizeUser(
    user: Omit<UserEntity, 'role' | 'doctorId'> & {
      role: Role | string;
      doctorId?: string | null;
      doctorProfile?: { id: string } | null;
    },
  ): UserEntity {
    return {
      ...user,
      name: user.name.trim(),
      email: user.email.trim().toLowerCase(),
      password: user.password,
      role: user.role as Role,
      doctorId: user.doctorProfile?.id ?? user.doctorId ?? undefined,
    };
  }
}
