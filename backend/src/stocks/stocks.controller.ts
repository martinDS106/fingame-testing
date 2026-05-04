import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StocksService } from './stocks.service';

@ApiTags('Stocks')
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocks: StocksService) {}

  @Get()
  list() {
    return this.stocks.list();
  }

  @Get(':symbol')
  bySymbol(@Param('symbol') symbol: string) {
    return this.stocks.bySymbol(symbol);
  }
}
