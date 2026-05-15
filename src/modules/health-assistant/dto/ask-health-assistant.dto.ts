import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AskHealthAssistantDto {
  @ApiProperty({
    example: 'Apa makanan yang sebaiknya dihindari penderita diabetes?',
  })
  @IsString()
  @MinLength(1)
  message!: string;
}
