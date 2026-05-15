import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { NonEmptyStringPipe } from '../../common/pipes/non-empty-string.pipe';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a regular user account by ID' })
  async remove(@Param('id', NonEmptyStringPipe) id: string) {
    return {
      item: await this.usersService.deleteUser(id),
    };
  }
}
