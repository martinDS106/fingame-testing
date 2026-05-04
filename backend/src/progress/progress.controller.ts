import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';
import { UpsertProgressDto } from './dto/upsert-progress.dto';
import { ProgressService } from './progress.service';

@ApiTags('Progress')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get()
  @ApiQuery({ name: 'kind', required: false, example: 'lesson' })
  list(@CurrentUser() user: JwtPayload, @Query('kind') kind?: string) {
    return this.progress.list(user.sub, kind);
  }

  @Post('upsert')
  upsert(@CurrentUser() user: JwtPayload, @Body() dto: UpsertProgressDto) {
    return this.progress.upsert({
      userId: user.sub,
      kind: dto.kind,
      refId: dto.refId,
      progress: dto.progress,
      completed: dto.completed,
    });
  }
}
