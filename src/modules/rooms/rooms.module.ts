// Module ruangan.
// Fitur ini bertanggung jawab menyediakan data ruangan yang bisa dipilih saat booking.
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DoctorsModule } from '../doctors/doctors.module';
import { DoctorRoomsController } from './doctor-rooms.controller';
import { RoomsController } from './rooms.controller';
import { RoomsRepository } from './rooms.repository';
import { RoomsService } from './rooms.service';

@Module({
  imports: [AuthModule, DoctorsModule],
  controllers: [RoomsController, DoctorRoomsController],
  providers: [RoomsRepository, RoomsService],
  exports: [RoomsRepository, RoomsService],
})
export class RoomsModule {}
