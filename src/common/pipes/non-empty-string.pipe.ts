// Pipe validasi sederhana untuk memastikan parameter string tidak kosong.
// Pipe di NestJS berjalan sebelum nilai masuk ke method controller.
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class NonEmptyStringPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    // Tolak jika value bukan string atau hanya berisi spasi kosong.
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException('Value must be a non-empty string');
    }

    // trim() membuat hasil akhir lebih bersih untuk dipakai pada service/repository.
    return value.trim();
  }
}
