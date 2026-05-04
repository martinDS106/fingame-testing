import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../auth/decorators/current-user';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';

@ApiTags('Simulator')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('sim')
export class SimController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('portfolio')
  async portfolio(@CurrentUser() user: JwtPayload) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { simCash: true },
    });
    const holdings = await this.prisma.investmentHolding.findMany({
      where: { userId: user.sub },
      orderBy: [{ updatedAt: 'desc' }],
      select: { symbol: true, shares: true, avgCost: true },
    });
    const trades = await this.prisma.investmentTrade.findMany({
      where: { userId: user.sub },
      orderBy: [{ at: 'desc' }],
      take: 200,
      select: {
        id: true,
        symbol: true,
        action: true,
        shares: true,
        price: true,
        orderType: true,
        at: true,
      },
    });
    return {
      cash: dbUser?.simCash ?? 100000,
      holdings: holdings.map((h) => ({
        symbol: h.symbol,
        shares: h.shares,
        avgCost: Number(h.avgCost),
      })),
      trades: trades.map((t) => ({
        id: t.id,
        symbol: t.symbol,
        action: t.action,
        shares: t.shares,
        price: Number(t.price),
        orderType: t.orderType ?? undefined,
        at: t.at.getTime(),
      })),
    };
  }

  @Post('cash')
  async setCash(
    @CurrentUser() user: JwtPayload,
    @Body() dto: { cash: number },
  ) {
    const cash = Math.max(0, Math.floor(Number(dto.cash ?? 0)));
    await this.prisma.user.update({
      where: { id: user.sub },
      data: { simCash: cash },
    });
    return { ok: true };
  }

  @Post('holdings/upsert')
  async upsertHolding(
    @CurrentUser() user: JwtPayload,
    @Body() dto: { symbol: string; shares: number; avgCost: number },
  ) {
    const symbol = String(dto.symbol ?? '')
      .trim()
      .toUpperCase();
    const shares = Math.max(0, Math.floor(Number(dto.shares ?? 0)));
    const avgCost = Number(dto.avgCost ?? 0);

    if (!symbol) return { ok: false, error: 'Missing symbol' };

    if (shares <= 0) {
      await this.prisma.investmentHolding.deleteMany({
        where: { userId: user.sub, symbol },
      });
      return { ok: true };
    }

    await this.prisma.investmentHolding.upsert({
      where: { userId_symbol: { userId: user.sub, symbol } },
      update: { shares, avgCost },
      create: { userId: user.sub, symbol, shares, avgCost },
    });
    return { ok: true };
  }

  @Post('trades')
  async pushTrade(
    @CurrentUser() user: JwtPayload,
    @Body()
    dto: {
      id: string;
      symbol: string;
      action: 'buy' | 'sell';
      shares: number;
      price: number;
      orderType?: string;
      at: number;
    },
  ) {
    const id = String(dto.id ?? '').trim();
    const symbol = String(dto.symbol ?? '')
      .trim()
      .toUpperCase();
    const action = dto.action === 'sell' ? 'sell' : 'buy';
    const shares = Math.max(1, Math.floor(Number(dto.shares ?? 0)));
    const price = Number(dto.price ?? 0);
    const at = new Date(Number(dto.at ?? Date.now()));
    const orderType = dto.orderType ? String(dto.orderType) : null;

    if (!id || !symbol) return { ok: false, error: 'Missing fields' };

    await this.prisma.investmentTrade.upsert({
      where: { id },
      update: {
        symbol,
        action,
        shares,
        price,
        orderType,
        at,
        userId: user.sub,
      },
      create: {
        id,
        userId: user.sub,
        symbol,
        action,
        shares,
        price,
        orderType,
        at,
      },
    });

    return { ok: true };
  }

  @Post('banking/txns')
  async pushBankingTxn(
    @CurrentUser() user: JwtPayload,
    @Body()
    dto: {
      id: string;
      accountId: string;
      amount: number;
      type: string;
      category: string;
      note?: string;
      at: number;
    },
  ) {
    const id = String(dto.id ?? '').trim();
    const accountId = String(dto.accountId ?? '').trim();
    const amount = Number(dto.amount ?? 0);
    const type = String(dto.type ?? '').trim();
    const category = String(dto.category ?? '').trim();
    const note = dto.note ? String(dto.note) : null;
    const at = new Date(Number(dto.at ?? Date.now()));

    if (!id || !accountId || !type || !category) {
      return { ok: false, error: 'Missing fields' };
    }

    await this.prisma.bankingTransaction.upsert({
      where: { id },
      update: { accountId, amount, type, category, note, at, userId: user.sub },
      create: {
        id,
        userId: user.sub,
        accountId,
        amount,
        type,
        category,
        note,
        at,
      },
    });
    return { ok: true };
  }
}
