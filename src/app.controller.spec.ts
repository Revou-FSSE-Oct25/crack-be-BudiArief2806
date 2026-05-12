// File test untuk AppController.
// Tujuannya memastikan controller root bisa dibuat dan mengembalikan
// response dari AppService seperti yang diharapkan.
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    // TestingModule adalah container NestJS versi test.
    // Di sini kita mendaftarkan controller dan provider yang dibutuhkan.
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    // Ambil instance controller dari container test.
    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API status metadata', () => {
      expect(appController.getHello()).toEqual({
        name: 'Diabstrok API',
        status: 'ok',
        docs: '/api',
      });
    });
  });
});
