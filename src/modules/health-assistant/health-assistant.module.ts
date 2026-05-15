import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HealthAssistantController } from './health-assistant.controller';
import { HealthAssistantRepository } from './health-assistant.repository';
import { HealthAssistantService } from './health-assistant.service';

@Module({
  imports: [AuthModule],
  controllers: [HealthAssistantController],
  providers: [HealthAssistantRepository, HealthAssistantService],
  exports: [HealthAssistantRepository, HealthAssistantService],
})
export class HealthAssistantModule {}
