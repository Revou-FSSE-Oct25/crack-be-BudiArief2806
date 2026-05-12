import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { BookingStatus } from '../../../common/enums/domain.enums';

export class UpdateBookingDto {
  @ApiPropertyOptional({ example: 'thb' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  hospitalId?: string;

  @ApiPropertyOptional({ example: 'd2' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  doctorId?: string;

  @ApiPropertyOptional({ example: 'r1' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  roomId?: string;

  @ApiPropertyOptional({ example: 'Kontrol lanjutan untuk evaluasi gula darah.' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  complaint?: string;

  @ApiPropertyOptional({ enum: BookingStatus, example: BookingStatus.CONFIRMED })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
