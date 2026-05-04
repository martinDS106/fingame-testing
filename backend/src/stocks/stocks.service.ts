import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StocksService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.stockPrice.findMany({ orderBy: [{ symbol: 'asc' }] });
  }

  async bySymbol(symbolRaw: string) {
    const symbol = symbolRaw.trim().toUpperCase();
    const row = await this.prisma.stockPrice.findUnique({ where: { symbol } });
    if (!row) throw new NotFoundException('Stock symbol not found');
    return row;
  }
}
