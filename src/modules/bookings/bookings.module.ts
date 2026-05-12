// Module booking yang menghubungkan controller, service, repository, dan module pendukung.
// Booking bergantung pada auth, rumah sakit, dokter, dan ruangan,
// karena data-data itu dipakai saat membuat booking.
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DoctorsModule } from '../doctors/doctors.module';
import { HospitalsModule } from '../hospitals/hospitals.module';
import { RoomsModule } from '../rooms/rooms.module';
import { BookingsController } from './bookings.controller';
import { BookingsRepository } from './bookings.repository';
import { BookingsService } from './bookings.service';

@Module({
  imports: [AuthModule, HospitalsModule, DoctorsModule, RoomsModule],
  controllers: [BookingsController],
  providers: [BookingsRepository, BookingsService],
  exports: [BookingsRepository, BookingsService],
})
export class BookingsModule {}
