import { Injectable } from '@nestjs/common';
import { Prisma, UserProgress } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, kind?: string) {
    return this.prisma.userProgress.findMany({
      where: { userId, ...(kind ? { kind } : {}) },
      orderBy: [{ updatedAt: 'desc' }],
    });
  }

  async upsert(params: {
    userId: string;
    kind: UserProgress['kind'];
    refId: string;
    progress: number;
    completed?: boolean;
  }) {
    const p = new Prisma.Decimal(params.progress);
    const completed =
      params.completed !== undefined
        ? Boolean(params.completed)
        : params.progress >= 100;
    return this.prisma.userProgress.upsert({
      where: {
        userId_kind_refId: {
          userId: params.userId,
          kind: params.kind,
          refId: params.refId,
        },
      },
      update: {
        progress: p,
        completed,
        updatedAt: new Date(),
      },
      create: {
        userId: params.userId,
        kind: params.kind,
        refId: params.refId,
        progress: p,
        completed,
        updatedAt: new Date(),
      },
    });
  }
}
