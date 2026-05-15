// Controller auth.
// Endpoint di file ini dipakai frontend untuk register, login,
// dan membaca profil user yang sedang login.
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import type { PublicUser } from '../users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Endpoint register menerima data user baru
  // lalu meneruskannya ke AuthService.
  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // Endpoint login mengembalikan token dan profil public user jika berhasil.
  @Post('login')
  @ApiOperation({ summary: 'Login and receive a bearer token' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify a user email using a verification token' })
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('google')
  @ApiOperation({ summary: 'Login or register using a Google ID token' })
  googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto);
  }

  // Endpoint me hanya bisa diakses setelah lolos AuthGuard.
  // User aktif diambil dari decorator @CurrentUser().
  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve the current authenticated user' })
  me(@CurrentUser() user: PublicUser) {
    return { user };
  }
}
