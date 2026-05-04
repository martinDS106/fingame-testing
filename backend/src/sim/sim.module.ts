import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SimController } from './sim.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SimController],
})
export class SimModule {}
