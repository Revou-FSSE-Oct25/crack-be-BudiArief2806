// Controller dokter.
// Endpoint ini dipakai frontend saat user memilih dokter untuk booking.
import {
  Body,
  Controller,
  Delete,
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
import { Specialty } from '../../common/enums/domain.enums';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UpdateDoctorAvailabilityDto } from './dto/update-doctor-availability.dto';
import { DoctorsService } from './doctors.service';

@ApiTags('doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  // Endpoint list dokter mendukung filter opsional berdasarkan rumah sakit dan spesialis.
  @Get()
  @ApiOperation({ summary: 'List all doctors' })
  @ApiQuery({ name: 'hospitalId', required: false })
  @ApiQuery({ name: 'hospitalName', required: false })
  @ApiQuery({ name: 'specialty', required: false, enum: Specialty })
  async findAll(
    @Query('hospitalId') hospitalId?: string,
    @Query('hospitalName') hospitalName?: string,
    @Query('specialty') specialty?: Specialty,
  ) {
    return {
      items: await this.doctorsService.findAll({
        hospitalId,
        hospitalName,
        specialty,
      }),
    };
  }

  @Patch(':id/availability')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update doctor availability by doctor ID' })
  async updateAvailability(
    @Param('id', NonEmptyStringPipe) id: string,
    @Body() dto: UpdateDoctorAvailabilityDto,
  ) {
    return {
      item: await this.doctorsService.updateAvailability(id, dto.available),
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete doctor and linked doctor account by ID' })
  async remove(@Param('id', NonEmptyStringPipe) id: string) {
    return {
      item: await this.doctorsService.deleteDoctor(id),
    };
  }
}
