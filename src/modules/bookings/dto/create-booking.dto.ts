// DTO untuk payload pembuatan booking baru.
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBookingDto {
  // ID rumah sakit yang dipilih user.
  @ApiProperty({ example: 'thb' })
  @IsString()
  @MinLength(1)
  hospitalId!: string;

  // ID dokter yang dipilih user.
  @ApiProperty({ example: 'd2' })
  @IsString()
  @MinLength(1)
  doctorId!: string;

  // ID ruangan yang dipilih user.
  @ApiProperty({ example: 'r1' })
  @IsString()
  @MinLength(1)
  roomId!: string;

  // Keluhan awal pasien.
  @ApiProperty({ example: 'Kontrol rutin Diabstrok' })
  @IsString()
  @MinLength(5)
  complaint!: string;

  // Diisi admin saat mendaftarkan pasien walk-in di rumah sakit.
  @ApiProperty({
    example: 'Budi Santoso',
    required: false,
    description: 'Nama pasien untuk booking walk-in yang dibuat admin',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  patientName?: string;

  // Umur pasien walk-in. User biasa tidak wajib mengirim kolom ini.
  @ApiProperty({
    example: 54,
    required: false,
    description: 'Umur pasien untuk booking walk-in yang dibuat admin',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(120)
  patientAge?: number;
}
