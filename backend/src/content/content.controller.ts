import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('bootstrap')
  async bootstrap() {
    const [courses, quizzes, stocks] = await Promise.all([
      this.prisma.course.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
          lessons: {
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            include: {
              videos: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
            },
          },
        },
      }),
      this.prisma.quiz.findMany({
        orderBy: [{ createdAt: 'desc' }],
        // Do NOT include questions here. It's a large payload and can time out on device.
      }),
      this.prisma.stockPrice.findMany({ orderBy: [{ symbol: 'asc' }] }),
    ]);

    // Flatten lessons/videos for the mobile app’s existing store structure.
    const lessons = courses.flatMap((c) => c.lessons ?? []);
    const videos = lessons.flatMap((l) => l.videos ?? []);

    return {
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        titleAr: c.titleAr ?? null,
        description: c.description ?? null,
        descriptionAr: c.descriptionAr ?? null,
        topic: c.topic,
        icon: c.icon ?? '📚',
        color: c.color ?? '#2563eb',
        sortOrder: c.sortOrder ?? 0,
        coinReward: c.coinReward ?? 0,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.createdAt.toISOString(),
      })),
      lessons: lessons.map((l) => ({
        id: l.id,
        courseId: l.courseId,
        title: l.title,
        titleAr: l.titleAr ?? null,
        summary: l.summary ?? null,
        summaryAr: l.summaryAr ?? null,
        durationMinutes: l.durationMinutes ?? 0,
        sortOrder: l.sortOrder ?? 0,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.createdAt.toISOString(),
      })),
      videos: videos.map((v) => ({
        id: v.id,
        lessonId: v.lessonId,
        title: v.title,
        titleAr: v.titleAr ?? null,
        url: v.url,
        thumbnail: v.thumbnail ?? null,
        durationSeconds: v.durationSeconds ?? 0,
        sortOrder: v.sortOrder ?? 0,
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.createdAt.toISOString(),
      })),
      quizzes: quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        titleAr: q.titleAr ?? null,
        description: q.description ?? null,
        descriptionAr: q.descriptionAr ?? null,
        category: q.category ?? 'general',
        difficulty: (q.difficulty as 'easy' | 'medium' | 'hard') ?? 'easy',
        coinReward: q.coinReward ?? 0,
        createdAt: q.createdAt.toISOString(),
        updatedAt: q.createdAt.toISOString(),
      })),
      questions: [],
      stocks: stocks.map((s) => ({
        symbol: s.symbol,
        name: s.symbol,
        price: Number(s.price),
        changePercent: 0,
        updatedAt: s.updatedAt.toISOString(),
      })),
    };
  }
}
