// Controller relasi dokter-ruangan.
// Endpoint ini dipakai admin saat ingin mengatur availability ruangan
// yang hanya berlaku untuk satu dokter tertentu.
import {
  Body,
  Controller,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NonEmptyStringPipe } from '../../common/pipes/non-empty-string.pipe';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UpdateRoomAvailabilityDto } from './dto/update-room-availability.dto';
import { RoomsService } from './rooms.service';

@ApiTags('doctor-rooms')
@Controller('doctors/:doctorId/rooms')
export class DoctorRoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Patch(':roomId/availability')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update room availability for a specific doctor and room',
  })
  async updateAvailability(
    @Param('doctorId', NonEmptyStringPipe) doctorId: string,
    @Param('roomId', NonEmptyStringPipe) roomId: string,
    @Body() dto: UpdateRoomAvailabilityDto,
  ) {
    return {
      item: await this.roomsService.updateAvailabilityForDoctor(
        doctorId,
        roomId,
        dto.available,
      ),
    };
  }
}
