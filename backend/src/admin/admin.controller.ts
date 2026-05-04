import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertStockDto } from './dto/upsert-stock.dto';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpsertCourseDto } from './dto/upsert-course.dto';
import { UpsertLessonDto } from './dto/upsert-lesson.dto';
import { UpsertVideoDto } from './dto/upsert-video.dto';
import { UpsertQuizDto } from './dto/upsert-quiz.dto';
import { UpsertQuestionDto } from './dto/upsert-question.dto';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('videos/upload')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 250 * 1024 * 1024 } }),
  )
  uploadVideo(@UploadedFile() fileUnknown?: unknown) {
    type Uploaded = {
      buffer: Buffer;
      mimetype?: string;
      originalname?: string;
    };
    const file = fileUnknown as Uploaded | undefined;
    if (!file?.buffer) return { ok: false, error: 'Missing file' };

    const dir = path.join(process.cwd(), 'uploads', 'videos');
    fs.mkdirSync(dir, { recursive: true });

    const mime = String(file.mimetype ?? '').toLowerCase();
    const ext =
      mime === 'video/mp4'
        ? '.mp4'
        : mime === 'video/quicktime'
          ? '.mov'
          : mime === 'video/webm'
            ? '.webm'
            : path.extname(String(file.originalname ?? '')) || '.mp4';

    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    fs.writeFileSync(path.join(dir, name), file.buffer);

    return { ok: true, url: `/uploads/videos/${name}` };
  }

  @Get('counts')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async counts() {
    const [users, courses, lessons, videos, quizzes, questions] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.course.count(),
        this.prisma.lesson.count(),
        this.prisma.video.count(),
        this.prisma.quiz.count(),
        this.prisma.question.count(),
      ]);

    return {
      users,
      courses,
      lessons,
      videos,
      quizzes,
      questions,
      marketplaceProducts: 0,
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async stats() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      usersTotal,
      usersActive7d,
      coinsAgg,
      xpAgg,
      quizAttemptsTotal,
      coinsLogTotal,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { lastActiveDate: { gte: sevenDaysAgo } },
      }),
      this.prisma.user.aggregate({ _sum: { coins: true } }),
      this.prisma.user.aggregate({ _sum: { xp: true } }),
      this.prisma.quizAttempt.count(),
      this.prisma.coinsLog.count(),
    ]);

    return {
      users_total: usersTotal,
      users_active_7d: usersActive7d,
      coins_total: coinsAgg._sum.coins ?? 0,
      xp_total: xpAgg._sum.xp ?? 0,
      quiz_attempts_total: quizAttemptsTotal,
      coins_log_total: coinsLogTotal,
      redemptions_total: 0,
      redemptions_pending: 0,
      redemptions_fulfilled: 0,
      redemptions_rejected: 0,
    };
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async users(@Query('limit') limit?: string) {
    const n = Number(limit);
    const take = Math.max(1, Math.min(500, Number.isFinite(n) ? n : 200));
    const rows = await this.prisma.user.findMany({
      orderBy: [{ createdAt: 'desc' }],
      take,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatar: true,
        level: true,
        isAdmin: true,
        coins: true,
        xp: true,
        streak: true,
        longestStreak: true,
        lastActiveDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return rows;
  }

  @Patch('users/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
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
    if (dto.isAdmin !== undefined) data.isAdmin = dto.isAdmin;

    const row = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatar: true,
        level: true,
        isAdmin: true,
        coins: true,
        xp: true,
        streak: true,
        longestStreak: true,
        lastActiveDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return row;
  }

  @Post('stocks/:symbol')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async upsertStock(
    @Param('symbol') symbolRaw: string,
    @Body() dto: UpsertStockDto,
  ) {
    const symbol = symbolRaw.trim().toUpperCase();
    const row = await this.prisma.stockPrice.upsert({
      where: { symbol },
      update: {
        price: new Prisma.Decimal(dto.price),
        updatedAt: new Date(),
      },
      create: {
        symbol,
        price: new Prisma.Decimal(dto.price),
        updatedAt: new Date(),
      },
    });
    return row;
  }

  @Post('courses')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async upsertCourse(@Body() dto: UpsertCourseDto) {
    const row = await this.prisma.course.upsert({
      where: { id: dto.id },
      update: {
        title: dto.title,
        titleAr: dto.titleAr ?? null,
        description: dto.description ?? null,
        descriptionAr: dto.descriptionAr ?? null,
        topic: dto.topic,
        icon: dto.icon ?? null,
        color: dto.color ?? null,
        sortOrder: dto.sortOrder,
        coinReward: dto.coinReward,
      },
      create: {
        id: dto.id,
        title: dto.title,
        titleAr: dto.titleAr ?? null,
        description: dto.description ?? null,
        descriptionAr: dto.descriptionAr ?? null,
        topic: dto.topic,
        icon: dto.icon ?? null,
        color: dto.color ?? null,
        sortOrder: dto.sortOrder,
        coinReward: dto.coinReward,
      },
    });
    return row;
  }

  @Delete('courses/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteCourse(@Param('id') id: string) {
    await this.prisma.course.delete({ where: { id } });
    return { ok: true };
  }

  @Post('lessons')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async upsertLesson(@Body() dto: UpsertLessonDto) {
    return this.prisma.lesson.upsert({
      where: { id: dto.id },
      update: {
        courseId: dto.courseId,
        title: dto.title,
        titleAr: dto.titleAr ?? null,
        summary: dto.summary ?? null,
        summaryAr: dto.summaryAr ?? null,
        durationMinutes: dto.durationMinutes,
        sortOrder: dto.sortOrder,
      },
      create: {
        id: dto.id,
        courseId: dto.courseId,
        title: dto.title,
        titleAr: dto.titleAr ?? null,
        summary: dto.summary ?? null,
        summaryAr: dto.summaryAr ?? null,
        durationMinutes: dto.durationMinutes,
        sortOrder: dto.sortOrder,
      },
    });
  }

  @Delete('lessons/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteLesson(@Param('id') id: string) {
    await this.prisma.lesson.delete({ where: { id } });
    return { ok: true };
  }

  @Post('videos')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async upsertVideo(@Body() dto: UpsertVideoDto) {
    return this.prisma.video.upsert({
      where: { id: dto.id },
      update: {
        lessonId: dto.lessonId,
        title: dto.title,
        titleAr: dto.titleAr ?? null,
        url: dto.url,
        thumbnail: dto.thumbnail ?? null,
        durationSeconds: dto.durationSeconds,
        sortOrder: dto.sortOrder,
      },
      create: {
        id: dto.id,
        lessonId: dto.lessonId,
        title: dto.title,
        titleAr: dto.titleAr ?? null,
        url: dto.url,
        thumbnail: dto.thumbnail ?? null,
        durationSeconds: dto.durationSeconds,
        sortOrder: dto.sortOrder,
      },
    });
  }

  @Delete('videos/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteVideo(@Param('id') id: string) {
    await this.prisma.video.delete({ where: { id } });
    return { ok: true };
  }

  @Post('quizzes')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async upsertQuiz(@Body() dto: UpsertQuizDto) {
    return this.prisma.quiz.upsert({
      where: { id: dto.id },
      update: {
        title: dto.title,
        titleAr: dto.titleAr ?? null,
        description: dto.description ?? null,
        descriptionAr: dto.descriptionAr ?? null,
        category: dto.category,
        difficulty: dto.difficulty,
        coinReward: dto.coinReward,
      },
      create: {
        id: dto.id,
        title: dto.title,
        titleAr: dto.titleAr ?? null,
        description: dto.description ?? null,
        descriptionAr: dto.descriptionAr ?? null,
        category: dto.category,
        difficulty: dto.difficulty,
        coinReward: dto.coinReward,
      },
    });
  }

  @Delete('quizzes/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteQuiz(@Param('id') id: string) {
    await this.prisma.quiz.delete({ where: { id } });
    return { ok: true };
  }

  @Post('questions')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async upsertQuestion(@Body() dto: UpsertQuestionDto) {
    return this.prisma.question.upsert({
      where: { id: dto.id },
      update: {
        quizId: dto.quizId,
        question: dto.question,
        questionAr: dto.questionAr ?? null,
        options: dto.options,
        optionsAr: dto.optionsAr
          ? (dto.optionsAr as Prisma.JsonArray)
          : Prisma.DbNull,
        correctIndex: dto.correctIndex,
        explanation: dto.explanation ?? null,
        explanationAr: dto.explanationAr ?? null,
        sortOrder: dto.sortOrder,
      },
      create: {
        id: dto.id,
        quizId: dto.quizId,
        question: dto.question,
        questionAr: dto.questionAr ?? null,
        options: dto.options,
        optionsAr: dto.optionsAr
          ? (dto.optionsAr as Prisma.JsonArray)
          : Prisma.DbNull,
        correctIndex: dto.correctIndex,
        explanation: dto.explanation ?? null,
        explanationAr: dto.explanationAr ?? null,
        sortOrder: dto.sortOrder,
      },
    });
  }

  @Delete('questions/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteQuestion(@Param('id') id: string) {
    await this.prisma.question.delete({ where: { id } });
    return { ok: true };
  }

  @Delete('stocks/:symbol')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteStock(@Param('symbol') symbolRaw: string) {
    const symbol = symbolRaw.trim().toUpperCase();
    await this.prisma.stockPrice.delete({ where: { symbol } });
    return { ok: true };
  }
}
