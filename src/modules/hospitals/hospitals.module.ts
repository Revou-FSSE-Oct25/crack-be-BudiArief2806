// Module rumah sakit.
// Module ini mengelompokkan controller, service, dan repository
// yang berhubungan dengan data rumah sakit.
import { Module } from '@nestjs/common';
import { HospitalsController } from './hospitals.controller';
import { HospitalsRepository } from './hospitals.repository';
import { HospitalsService } from './hospitals.service';

@Module({
  controllers: [HospitalsController],
  providers: [HospitalsRepository, HospitalsService],
  exports: [HospitalsRepository, HospitalsService],
})
export class HospitalsModule {}
