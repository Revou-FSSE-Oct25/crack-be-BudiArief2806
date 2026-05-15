import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateBookingMessageDto {
  @ApiProperty({
    example: 'Halo admin, saya ingin memastikan bukti pembayaran saya sudah diterima.',
  })
  @IsString()
  @MinLength(1)
  message!: string;
}
