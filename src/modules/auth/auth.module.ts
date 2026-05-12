// Module auth yang merangkai controller, service, repository, dan guard auth.
// Semua kebutuhan fitur autentikasi dikelompokkan di sini.
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';

@Module({
  // Auth membutuhkan akses ke UsersModule
  // untuk membuat user baru dan membaca data user saat login.
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'diabstrok-super-secret',
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],

  // Controller menerima request HTTP dari luar.
  controllers: [AuthController],

  // Provider adalah class yang akan dikelola dependency injection NestJS.
  providers: [AuthService, AuthGuard, AdminGuard],

  // Export diperlukan agar module lain bisa memakai service/guard auth.
  exports: [AuthService, AuthGuard, AdminGuard],
})
export class AuthModule {}
