import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../auth/decorators/current-user';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';
import { UpdateMeDto } from './dto/update-me.dto';
import { AppendCoinsDto } from './dto/append-coins.dto';

@ApiTags('Me')
@Controller('me')
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async me(@CurrentUser() user: JwtPayload) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        email: true,
        isAdmin: true,
        displayName: true,
        avatar: true,
        level: true,
        coins: true,
        xp: true,
        streak: true,
        longestStreak: true,
        lastActiveDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { user: dbUser };
  }

  @Get('coins-log')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  async coinsLog(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: string,
  ) {
    const n = Number(limit);
    const take = Math.max(1, Math.min(200, Number.isFinite(n) ? n : 50));
    const rows = await this.prisma.coinsLog.findMany({
      where: { userId: user.sub },
      orderBy: [{ createdAt: 'desc' }],
      take,
      select: {
        id: true,
        userId: true,
        amount: true,
        reason: true,
        createdAt: true,
      },
    });
    return rows.map((r) => ({
      id: r.id,
      user_id: r.userId,
      amount: r.amount,
      reason: r.reason,
      created_at: r.createdAt.toISOString(),
    }));
  }

  @Get('quiz-attempts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  async quizAttempts(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: string,
  ) {
    const n = Number(limit);
    const take = Math.max(1, Math.min(200, Number.isFinite(n) ? n : 50));
    const rows = await this.prisma.quizAttempt.findMany({
      where: { userId: user.sub },
      orderBy: [{ completedAt: 'desc' }],
      take,
      select: {
        id: true,
        quizId: true,
        score: true,
        total: true,
        coinsEarned: true,
        completedAt: true,
        quiz: { select: { title: true, titleAr: true } },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      quiz_id: r.quizId,
      quiz_title: r.quiz?.title ?? '',
      quiz_title_ar: r.quiz?.titleAr ?? null,
      score: r.score,
      total: r.total,
      coins_earned: r.coinsEarned,
      completed_at: r.completedAt.toISOString(),
    }));
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateMeDto) {
    const data: {
      displayName?: string;
      avatar?: string | null;
      level?: string;
      coins?: number;
      xp?: number;
      streak?: number;
      longestStreak?: number;
      lastActiveDate?: Date | null;
    } = {};
    if (dto.displayName !== undefined) data.displayName = dto.displayName;
    if (dto.avatar !== undefined) data.avatar = dto.avatar;
    if (dto.level !== undefined) data.level = dto.level;
    if (dto.coins !== undefined) data.coins = dto.coins;
    if (dto.xp !== undefined) data.xp = dto.xp;
    if (dto.streak !== undefined) data.streak = dto.streak;
    if (dto.longestStreak !== undefined) data.longestStreak = dto.longestStreak;
    if (dto.lastActiveDate !== undefined) {
      data.lastActiveDate = dto.lastActiveDate
        ? new Date(dto.lastActiveDate)
        : null;
    }

    const dbUser = await this.prisma.user.update({
      where: { id: user.sub },
      data,
      select: {
        id: true,
        email: true,
        isAdmin: true,
        displayName: true,
        avatar: true,
        level: true,
        coins: true,
        xp: true,
        streak: true,
        longestStreak: true,
        lastActiveDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { user: dbUser };
  }

  @Post('coins')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async appendCoins(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AppendCoinsDto,
  ) {
    if (dto.amount === 0) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.sub },
        select: {
          id: true,
          email: true,
          isAdmin: true,
          displayName: true,
          avatar: true,
          level: true,
          coins: true,
          xp: true,
          streak: true,
          longestStreak: true,
          lastActiveDate: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return { user: dbUser };
    }

    const dbUser = await this.prisma.$transaction(async (tx) => {
      const current = await tx.user.findUnique({
        where: { id: user.sub },
        select: { coins: true },
      });
      if (!current) {
        throw new BadRequestException('User not found');
      }

      const nextCoins = current.coins + dto.amount;
      if (nextCoins < 0) {
        throw new BadRequestException('Insufficient coins');
      }

      const updatedUser = await tx.user.update({
        where: { id: user.sub },
        data: {
          coins: nextCoins,
          lastActiveDate: new Date(),
        },
        select: {
          id: true,
          email: true,
          isAdmin: true,
          displayName: true,
          avatar: true,
          level: true,
          coins: true,
          xp: true,
          streak: true,
          longestStreak: true,
          lastActiveDate: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await tx.coinsLog.create({
        data: {
          userId: user.sub,
          amount: dto.amount,
          reason: dto.reason,
        },
      });

      return updatedUser;
    });

    return { user: dbUser };
  }
}
