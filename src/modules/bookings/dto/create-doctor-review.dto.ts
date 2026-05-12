import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { DiseaseStage } from '../../../common/enums/domain.enums';

export class CreateDoctorReviewDto {
  @ApiProperty({
    example: 'Sering haus, mudah lelah, dan kadar gula beberapa hari terakhir tinggi.',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  symptoms!: string;

  @ApiProperty({ example: 'Diabetes melitus tipe 2 terkontrol parsial.' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  diagnosis!: string;

  @ApiProperty({ example: 350000 })
  @IsInt()
  @Min(0)
  estimatedCost!: number;

  @ApiProperty({ example: 'Jaga pola makan, kurangi gula, dan kontrol ulang 1 minggu.' })
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  healthAdvice!: string;

  @ApiProperty({ enum: DiseaseStage, example: DiseaseStage.STADIUM_1 })
  @IsEnum(DiseaseStage)
  stage!: DiseaseStage;

  @ApiProperty({
    type: [String],
    example: ['Metformin 500mg 2x sehari setelah makan'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  items!: string[];

  @ApiProperty({
    example: 'Pantau gula darah puasa dan lanjutkan olahraga ringan.',
    required: false,
  })
  @IsString()
  @MaxLength(500)
  notes!: string;
}
