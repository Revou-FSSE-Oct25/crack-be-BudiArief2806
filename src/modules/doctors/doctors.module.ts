// Module dokter.
// Seluruh komponen untuk fitur data dokter dikelompokkan di sini.
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HospitalsModule } from '../hospitals/hospitals.module';
import { DoctorsController } from './doctors.controller';
import { DoctorsRepository } from './doctors.repository';
import { DoctorsService } from './doctors.service';

@Module({
  imports: [AuthModule, HospitalsModule],
  controllers: [DoctorsController],
  providers: [DoctorsRepository, DoctorsService],
  exports: [DoctorsRepository, DoctorsService],
})
export class DoctorsModule {}
