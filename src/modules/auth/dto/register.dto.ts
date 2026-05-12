// DTO untuk payload register dari client.
// Seluruh aturan validasi ditulis dekat dengan field-nya
// agar kontrak input mudah dibaca.
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  // Nama wajib diisi dengan panjang wajar.
  @ApiProperty({ example: 'Rina Diabstrok' })
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  // Email menjadi identitas unik user.
  @ApiProperty({ example: 'rina@diabstrok.id' })
  @IsEmail()
  email!: string;

  // Password dibatasi minimal dan maksimal panjangnya.
  @ApiProperty({ example: 'user1234' })
  @MinLength(6)
  @MaxLength(64)
  password!: string;
}
