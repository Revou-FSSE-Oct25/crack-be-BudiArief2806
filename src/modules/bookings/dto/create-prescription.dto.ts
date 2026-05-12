// DTO untuk payload resep yang dibuat admin.
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DiseaseStage } from '../../../common/enums/domain.enums';

export class CreatePrescriptionDto {
  // Stage penyakit wajib salah satu dari enum DiseaseStage.
  @ApiProperty({ enum: DiseaseStage, example: DiseaseStage.STADIUM_1 })
  @IsEnum(DiseaseStage)
  stage!: DiseaseStage;

  // Items berisi daftar obat/tindakan.
  @ApiProperty({
    type: [String],
    example: ['Metformin 500mg 2x sehari setelah makan'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  items!: string[];

  // Notes bersifat opsional untuk catatan tambahan.
  @ApiProperty({
    example: 'Kontrol 1 minggu dan pantau gula darah.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
