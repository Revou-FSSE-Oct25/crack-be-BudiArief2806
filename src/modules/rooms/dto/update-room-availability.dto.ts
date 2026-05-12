import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateRoomAvailabilityDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  available!: boolean;
}
