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
import { meUserSelect } from './user-select';
import { ensureUserReferralCode } from '../referral/referral-code.util';

function parseGoals(raw: string[] | undefined): string | null | undefined {
  if (raw === undefined) return undefined;
  return JSON.stringify(raw);
}

@ApiTags('Me')
@Controller('me')
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('referral-code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async referralCode(@CurrentUser() user: JwtPayload) {
    try {
      const code = await ensureUserReferralCode(this.prisma, user.sub);
      return { referralCode: code };
    } catch (err) {
      console.warn('[me] referral-code failed', err);
      throw new BadRequestException('Could not load referral code');
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async me(@CurrentUser() user: JwtPayload) {
    try {
      await ensureUserReferralCode(this.prisma, user.sub);
    } catch (err) {
      console.warn('[me] ensureUserReferralCode failed', err);
    }
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: meUserSelect,
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
    const data: Record<string, unknown> = {};
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
    if (dto.dateOfBirth !== undefined) {
      data.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    }
    if (dto.gender !== undefined) data.gender = dto.gender;
    if (dto.mobile !== undefined) data.mobile = dto.mobile;
    if (dto.governorate !== undefined) data.governorate = dto.governorate;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.userType !== undefined) data.userType = dto.userType;
    if (dto.schoolName !== undefined) data.schoolName = dto.schoolName;
    if (dto.facultyMajor !== undefined) data.facultyMajor = dto.facultyMajor;
    if (dto.academicYear !== undefined) data.academicYear = dto.academicYear;
    if (dto.employer !== undefined) data.employer = dto.employer;
    if (dto.monthlyIncomeRange !== undefined) {
      data.monthlyIncomeRange = dto.monthlyIncomeRange;
    }
    const goalsJson = parseGoals(dto.financialGoals);
    if (goalsJson !== undefined) data.financialGoals = goalsJson;
    if (dto.financialLiteracy !== undefined) {
      data.financialLiteracy = dto.financialLiteracy;
    }
    if (dto.persona !== undefined) data.persona = dto.persona;
    if (dto.parentEmail !== undefined) data.parentEmail = dto.parentEmail;
    if (dto.parentPhone !== undefined) data.parentPhone = dto.parentPhone;
    if (dto.referredByCode !== undefined) {
      const normalized = dto.referredByCode?.trim().toUpperCase() || null;
      if (normalized) {
        const self = await this.prisma.user.findUnique({
          where: { id: user.sub },
          select: { referralCode: true },
        });
        if (self?.referralCode && normalized === self.referralCode) {
          throw new BadRequestException('Cannot use your own referral code');
        }
      }
      data.referredByCode = normalized;
    }
    if (dto.profileCompletedAt !== undefined) {
      data.profileCompletedAt = dto.profileCompletedAt
        ? new Date(dto.profileCompletedAt)
        : null;
    }

    const dbUser = await this.prisma.user.update({
      where: { id: user.sub },
      data,
      select: meUserSelect,
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
        select: meUserSelect,
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
        select: meUserSelect,
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
