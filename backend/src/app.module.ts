import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { MeController } from './me/me.controller';
import { ProgressModule } from './progress/progress.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { AdminModule } from './admin/admin.module';
import { StocksModule } from './stocks/stocks.module';
import { SimModule } from './sim/sim.module';
import { MailModule } from './mail/mail.module';
import { ContentModule } from './content/content.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CoursesModule,
    QuizzesModule,
    ProgressModule,
    LeaderboardModule,
    AdminModule,
    StocksModule,
    SimModule,
    MailModule,
    ContentModule,
  ],
  controllers: [AppController, HealthController, MeController],
  providers: [AppService],
})
export class AppModule {}
