// DTO untuk payload login dari client.
// DTO membantu Nest melakukan validasi input sebelum logic service dijalankan.
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  // Email harus valid secara format.
  @ApiProperty({ example: 'rina@diabstrok.id' })
  @IsEmail()
  email!: string;

  // Password minimal 6 karakter agar tidak terlalu pendek.
  @ApiProperty({ example: 'user1234' })
  @MinLength(6)
  password!: string;
}
