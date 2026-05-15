import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { PublicUser } from '../users/entities/user.entity';
import { AskHealthAssistantDto } from './dto/ask-health-assistant.dto';
import { HealthAssistantService } from './health-assistant.service';

@ApiTags('health-assistant')
@ApiBearerAuth()
@Controller('health-assistant')
export class HealthAssistantController {
  constructor(private readonly healthAssistantService: HealthAssistantService) {}

  @Get('messages')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'List health assistant messages for the current user' })
  async findMessages(@CurrentUser() user: PublicUser) {
    return this.healthAssistantService.findMessages(user);
  }

  @Post('messages')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Ask the educational health assistant' })
  async ask(@CurrentUser() user: PublicUser, @Body() dto: AskHealthAssistantDto) {
    return this.healthAssistantService.ask(user, dto);
  }
}
