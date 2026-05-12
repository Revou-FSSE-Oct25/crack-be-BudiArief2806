// Controller booking.
// Endpoint di file ini menjadi jalur utama yang dipakai frontend dan Postman untuk booking.
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NonEmptyStringPipe } from '../../common/pipes/non-empty-string.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { PublicUser } from '../users/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateDoctorReviewDto } from './dto/create-doctor-review.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingsService } from './bookings.service';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Membuat booking baru untuk user yang sedang login.
  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a booking for the current user' })
  async create(@CurrentUser() user: PublicUser, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user, dto);
  }

  // Mengambil booking milik user sendiri.
  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'List bookings that belong to the current user' })
  async findMine(@CurrentUser() user: PublicUser) {
    return this.bookingsService.findMine(user);
  }

  // Mengambil semua booking untuk admin, atau booking yang ditugaskan ke dokter yang sedang login.
  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'List bookings for admin or the current doctor' })
  async findAll(@CurrentUser() user: PublicUser) {
    return this.bookingsService.findAll(user);
  }

  // Mengambil detail satu booking berdasarkan ID.
  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get booking detail' })
  async findOne(
    @Param('id', NonEmptyStringPipe) id: string,
    @CurrentUser() user: PublicUser,
  ) {
    return this.bookingsService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a booking' })
  async update(
    @Param('id', NonEmptyStringPipe) id: string,
    @CurrentUser() user: PublicUser,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, user, dto);
  }

  // Mengubah status booking, misalnya dari PENDING ke CONFIRMED.
  @Patch(':id/status')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update booking status' })
  async updateStatus(
    @Param('id', NonEmptyStringPipe) id: string,
    @CurrentUser() user: PublicUser,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, user, dto);
  }

  // Menghapus booking.
  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a booking' })
  async remove(
    @Param('id', NonEmptyStringPipe) id: string,
    @CurrentUser() user: PublicUser,
  ) {
    return this.bookingsService.delete(id, user);
  }

  // Menambahkan atau memperbarui resep booking.
  // Hanya admin yang diizinkan.
  @Post(':id/prescription')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Attach or update a prescription for a booking' })
  async createPrescription(
    @Param('id', NonEmptyStringPipe) id: string,
    @CurrentUser() user: PublicUser,
    @Body() dto: CreatePrescriptionDto,
  ) {
    return this.bookingsService.createPrescription(id, user, dto);
  }

  @Post(':id/doctor-review')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      'Attach or update doctor review data, including estimated cost, advice, and prescription',
  })
  async submitDoctorReview(
    @Param('id', NonEmptyStringPipe) id: string,
    @CurrentUser() user: PublicUser,
    @Body() dto: CreateDoctorReviewDto,
  ) {
    return this.bookingsService.submitDoctorReview(id, user, dto);
  }
}
