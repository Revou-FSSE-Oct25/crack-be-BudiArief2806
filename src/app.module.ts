// Import utility NestJS untuk membuat module dan mendaftarkan middleware.
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

// Controller dan service utama aplikasi.
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Middleware untuk logging request.
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';

// Module fitur yang membagi aplikasi berdasarkan domain.
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { HospitalsModule } from './modules/hospitals/hospitals.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { RealtimeModule } from './realtime/realtime.module';

// AppModule adalah root module, yaitu pintu masuk utama seluruh susunan aplikasi.
// Dari sini NestJS tahu module, controller, dan provider apa saja yang perlu dimuat.
@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    HospitalsModule,
    DoctorsModule,
    RoomsModule,
    BookingsModule,
    RealtimeModule,
  ],

  // Controller yang berada di lingkup AppModule.
  controllers: [AppController],

  // Provider/service yang berada di lingkup AppModule.
  providers: [AppService],
})
export class AppModule implements NestModule {
  // Method configure() tersedia karena class ini mengimplementasikan NestModule.
  // Di sinilah middleware bisa dipasang ke route tertentu.
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes({
      // path '*' berarti semua URL/endpoint.
      path: '*',

      // RequestMethod.ALL berarti semua method HTTP akan terkena middleware,
      // misalnya GET, POST, PUT, PATCH, DELETE, dan lain-lain.
      method: RequestMethod.ALL,
    });
  }
}
