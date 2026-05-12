// DTO untuk perubahan status booking.
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BookingStatus } from '../../../common/enums/domain.enums';

export class UpdateBookingStatusDto {
  // Status baru harus salah satu dari enum BookingStatus.
  @ApiProperty({ enum: BookingStatus, example: BookingStatus.CONFIRMED })
  @IsEnum(BookingStatus)
  status!: BookingStatus;
}
