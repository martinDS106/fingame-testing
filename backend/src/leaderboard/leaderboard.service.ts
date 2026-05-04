import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async top(limit = 10) {
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
    const users = await this.prisma.user.findMany({
      where: { isAdmin: false },
      orderBy: [{ coins: 'desc' }, { xp: 'desc' }, { updatedAt: 'desc' }],
      take: safeLimit,
      select: {
        id: true,
        displayName: true,
        avatar: true,
        coins: true,
        xp: true,
        streak: true,
      },
    });

    return users.map((u) => ({
      userId: u.id,
      displayName: u.displayName,
      avatar: u.avatar,
      coins: u.coins,
      xp: u.xp,
      streak: u.streak,
    }));
  }
}
