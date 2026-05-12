// Controller ruangan.
// Endpoint ini dipakai frontend untuk menampilkan pilihan ruangan.
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { NonEmptyStringPipe } from '../../common/pipes/non-empty-string.pipe';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UpdateRoomAvailabilityDto } from './dto/update-room-availability.dto';
import { RoomsService } from './rooms.service';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // Filter hospitalId bersifat opsional.
  // Jika tidak dikirim, semua ruangan akan dikembalikan.
  @Get()
  @ApiOperation({ summary: 'List all rooms' })
  @ApiQuery({ name: 'hospitalId', required: false })
  @ApiQuery({ name: 'doctorId', required: false })
  async findAll(
    @Query('hospitalId') hospitalId?: string,
    @Query('doctorId') doctorId?: string,
  ) {
    return {
      items: await this.roomsService.findAll({
        hospitalId,
        doctorId,
      }),
    };
  }

  @Patch(':id/availability')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update room availability by room ID' })
  async updateAvailability(
    @Param('id', NonEmptyStringPipe) id: string,
    @Body() dto: UpdateRoomAvailabilityDto,
  ) {
    return {
      item: await this.roomsService.updateAvailability(id, dto.available),
    };
  }
}
