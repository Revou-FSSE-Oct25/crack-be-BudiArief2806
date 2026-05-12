import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateDoctorAvailabilityDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  available!: boolean;
}
