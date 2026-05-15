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

  async findEntityByVerificationToken(
    token: string,
  ): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
      include: {
        doctorProfile: {
          select: { id: true },
        },
      },
    });

    return user ? this.sanitizeUser(user) : null;
  }

  async findEntityByGoogleId(googleId: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { googleId },
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
    emailVerified?: boolean;
    emailVerificationToken?: string | null;
    emailVerificationExpiresAt?: Date | null;
    googleId?: string | null;
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
        emailVerified: payload.emailVerified ?? true,
        emailVerificationToken: payload.emailVerificationToken ?? null,
        emailVerificationExpiresAt:
          payload.emailVerificationExpiresAt ?? null,
        googleId: payload.googleId ?? null,
      },
    });

    return this.toPublicUser(this.sanitizeUser(user));
  }

  async verifyEmail(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
      include: {
        doctorProfile: {
          select: { id: true },
        },
      },
    });

    return this.toPublicUser(this.sanitizeUser(user));
  }

  async updateEmailVerificationToken(
    id: string,
    payload: {
      emailVerificationToken: string | null;
      emailVerificationExpiresAt: Date | null;
    },
  ): Promise<PublicUser> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        emailVerificationToken: payload.emailVerificationToken,
        emailVerificationExpiresAt: payload.emailVerificationExpiresAt,
      },
      include: {
        doctorProfile: {
          select: { id: true },
        },
      },
    });

    return this.toPublicUser(this.sanitizeUser(user));
  }

  async updateGoogleIdentity(
    id: string,
    payload: { googleId: string; emailVerified?: boolean },
  ): Promise<PublicUser> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        googleId: payload.googleId,
        emailVerified: payload.emailVerified ?? true,
      },
      include: {
        doctorProfile: {
          select: { id: true },
        },
      },
    });

    return this.toPublicUser(this.sanitizeUser(user));
  }

  async deleteUser(id: string): Promise<PublicUser> {
    const user = await this.findEntityById(id);

    if (user.role === Role.ADMIN) {
      throw new ConflictException('Admin account cannot be deleted here');
    }

    if (user.role === Role.DOCTOR || user.doctorId) {
      throw new ConflictException(
        'Doctor accounts must be deleted via the doctor endpoint',
      );
    }

    const deletedUser = await this.prisma.user.delete({
      where: { id },
      include: {
        doctorProfile: {
          select: { id: true },
        },
      },
    });

    return this.toPublicUser(this.sanitizeUser(deletedUser));
  }

  toPublicUser(user: UserEntity): PublicUser {
    const sanitizedUser = this.sanitizeUser(user);

    return {
      id: sanitizedUser.id,
      name: sanitizedUser.name,
      email: sanitizedUser.email,
      role: sanitizedUser.role,
      emailVerified: sanitizedUser.emailVerified,
      googleId: sanitizedUser.googleId,
      doctorId: sanitizedUser.doctorId,
      createdAt: sanitizedUser.createdAt,
      updatedAt: sanitizedUser.updatedAt,
    };
  }

  private sanitizeUser(
    user: {
      id: string;
      name: string;
      email: string;
      password: string;
      role: Role | string;
      emailVerified?: boolean | null;
      emailVerificationToken?: string | null;
      emailVerificationExpiresAt?: Date | null;
      googleId?: string | null;
      createdAt: Date | string;
      updatedAt: Date | string;
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
      emailVerified: user.emailVerified ?? true,
      emailVerificationToken: user.emailVerificationToken ?? null,
      emailVerificationExpiresAt: user.emailVerificationExpiresAt ?? null,
      googleId: user.googleId ?? null,
      doctorId: user.doctorProfile?.id ?? user.doctorId ?? undefined,
    };
  }
}
