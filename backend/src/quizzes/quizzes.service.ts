import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.quiz.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async byId(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async createAttempt(params: {
    userId: string;
    quizId: string;
    score: number;
    total: number;
  }) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: params.quizId },
      select: { id: true, coinReward: true },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const safeTotal = Math.max(1, params.total);
    const ratio = Math.max(0, Math.min(1, params.score / safeTotal));
    const coinsEarned = Math.round(ratio * quiz.coinReward);
    const xpEarned = params.score;

    const [attempt] = await this.prisma.$transaction([
      this.prisma.quizAttempt.create({
        data: {
          userId: params.userId,
          quizId: quiz.id,
          score: params.score,
          total: safeTotal,
          coinsEarned,
        },
      }),
      this.prisma.user.update({
        where: { id: params.userId },
        data: {
          coins: { increment: coinsEarned },
          xp: { increment: xpEarned },
          lastActiveDate: new Date(),
        },
      }),
      this.prisma.coinsLog.create({
        data: {
          userId: params.userId,
          amount: coinsEarned,
          reason: `quiz_attempt:${quiz.id}`,
        },
      }),
    ]);

    return { attempt, coinsEarned, xpEarned };
  }
}
