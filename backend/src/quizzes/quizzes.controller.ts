import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';
import { QuizzesService } from './quizzes.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';

@ApiTags('Quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzes: QuizzesService) {}

  @Get()
  list() {
    return this.quizzes.list();
  }

  @Get(':id')
  byId(@Param('id') id: string) {
    return this.quizzes.byId(id);
  }

  @Post(':id/attempt')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  attempt(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateAttemptDto,
  ) {
    return this.quizzes.createAttempt({
      userId: user.sub,
      quizId: id,
      score: dto.score,
      total: dto.total,
    });
  }
}
