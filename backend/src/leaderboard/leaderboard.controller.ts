import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboard: LeaderboardService) {}

  @Get()
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  top(@Query('limit') limit?: string) {
    return this.leaderboard.top(limit ? Number(limit) : 10);
  }
}
