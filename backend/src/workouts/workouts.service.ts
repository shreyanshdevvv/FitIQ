import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { CreateWorkoutLogDto } from './dto/create-workout-log.dto';

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPlan(userId: string, dto: CreateWorkoutPlanDto) {
    return this.prisma.workoutPlan.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        isAiGenerated: dto.isAiGenerated ?? false,
        exercises: {
          create: dto.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            dayNumber: ex.dayNumber,
            orderInDay: ex.orderInDay,
            sets: ex.sets,
            reps: ex.reps,
            durationSeconds: ex.durationSeconds,
            restSeconds: ex.restSeconds,
            notes: ex.notes,
          })),
        },
      },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: [{ dayNumber: 'asc' }, { orderInDay: 'asc' }],
        },
      },
    });
  }

  async getMyPlans(userId: string) {
    return this.prisma.workoutPlan.findMany({
      where: { userId },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: [{ dayNumber: 'asc' }, { orderInDay: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlanById(userId: string, planId: string) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: { id: planId, userId },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: [{ dayNumber: 'asc' }, { orderInDay: 'asc' }],
        },
      },
    });
    if (!plan) throw new NotFoundException('Workout plan not found');
    return plan;
  }

  async createLog(userId: string, dto: CreateWorkoutLogDto) {
    return this.prisma.workoutLog.create({
      data: {
        userId,
        planId: dto.planId,
        workoutDate: new Date(dto.workoutDate),
        durationMinutes: dto.durationMinutes,
        perceivedDifficulty: dto.perceivedDifficulty,
        notes: dto.notes,
        exercises: {
          create: dto.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            setsCompleted: ex.setsCompleted,
            repsCompleted: ex.repsCompleted,
            weightUsed: ex.weightUsed,
            durationSeconds: ex.durationSeconds,
            notes: ex.notes,
          })),
        },
      },
      include: {
        exercises: {
          include: { exercise: true },
        },
      },
    });
  }

  async getMyLogs(userId: string) {
    return this.prisma.workoutLog.findMany({
      where: { userId },
      include: {
        exercises: {
          include: { exercise: true },
        },
        plan: {
          select: { id: true, name: true },
        },
      },
      orderBy: { workoutDate: 'desc' },
    });
  }

  async getWeeklyDeterministicStats(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [logs, profile] = await Promise.all([
      this.prisma.workoutLog.findMany({
        where: {
          userId,
          workoutDate: { gte: sevenDaysAgo },
        },
        include: {
          exercises: {
            include: { exercise: true },
          },
        },
      }),
      this.prisma.fitnessProfile.findUnique({
        where: { userId },
      }),
    ]);

    const totalSessions = logs.length;
    const totalMinutes = logs.reduce((acc, l) => acc + l.durationMinutes, 0);
    const plannedSessions = profile?.workoutDaysPerWeek || 4;
    const adherencePercentage = Math.min(
      100,
      Math.round((totalSessions / plannedSessions) * 100),
    );

    // Calculate trained muscles
    const muscleCount: Record<string, number> = {};
    for (const log of logs) {
      for (const ex of log.exercises) {
        for (const m of ex.exercise.muscleGroups) {
          muscleCount[m] = (muscleCount[m] || 0) + 1;
        }
      }
    }

    const mostTrainedMuscles = Object.entries(muscleCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([m]) => m);

    return {
      plannedSessions,
      completedSessions: totalSessions,
      adherencePercentage,
      totalDurationMinutes: totalMinutes,
      mostTrainedMuscles,
      recentLogs: logs,
    };
  }
}
