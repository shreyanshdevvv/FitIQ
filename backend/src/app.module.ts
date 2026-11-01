import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CoachesModule } from './coaches/coaches.module';
import { ExercisesModule } from './exercises/exercises.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { AiModule } from './ai/ai.module';
import { NutritionModule } from './nutrition/nutrition.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    PrismaModule,
    AuthModule,
    ProfilesModule,
    CoachesModule,
    ExercisesModule,
    WorkoutsModule,
    AiModule,
    NutritionModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
