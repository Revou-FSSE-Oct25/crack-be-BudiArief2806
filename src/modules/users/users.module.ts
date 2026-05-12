// Decorator utama untuk mendefinisikan module di NestJS.
import { Module } from '@nestjs/common';

// Class-class inti untuk fitur users.
import { UsersService } from './users.service';

// UsersModule adalah tempat mengelompokkan seluruh komponen yang berhubungan
// dengan fitur user agar rapi dan mudah dipakai module lain.
@Module({
  // providers adalah class yang akan dikelola oleh sistem dependency injection Nest.
  providers: [UsersService],

  // exports berarti provider ini boleh dipakai module lain
  // yang meng-import UsersModule.
  exports: [UsersService],
})
export class UsersModule {}
