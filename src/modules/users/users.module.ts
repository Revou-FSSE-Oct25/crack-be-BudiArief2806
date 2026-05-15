// Decorator utama untuk mendefinisikan module di NestJS.
import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

// Class-class inti untuk fitur users.
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// UsersModule adalah tempat mengelompokkan seluruh komponen yang berhubungan
// dengan fitur user agar rapi dan mudah dipakai module lain.
@Module({
  imports: [forwardRef(() => AuthModule)],

  // providers adalah class yang akan dikelola oleh sistem dependency injection Nest.
  providers: [UsersService],

  controllers: [UsersController],

  // exports berarti provider ini boleh dipakai module lain
  // yang meng-import UsersModule.
  exports: [UsersService],
})
export class UsersModule {}
