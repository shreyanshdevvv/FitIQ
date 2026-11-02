import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NutritionService {
  private readonly aiServiceUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
  }

  async getNutritionPlan(userId: string) {
    let plan = await this.prisma.nutritionPlan.findUnique({
      where: { userId },
    });

    if (!plan) {
      // Auto-generate if not yet created
      try {
        plan = await this.generateNutritionPlan(userId);
      } catch (err) {
        // Fallback default if profile is empty
        plan = await this.prisma.nutritionPlan.create({
          data: {
            userId,
            dailyCalories: 2400,
            proteinGrams: 160,
            carbs_grams: 280,
            fats_grams: 70,
            waterMl: 3000,
            dietaryStrategy: 'BALANCED',
            notes: 'Default athletic baseline. Update your physical profile to calibrate customized targets.',
            mealTimingTips: [
              'Consume 25-35g protein every 3-4 hours.',
              'Hydrate with at least 3 liters of water daily.',
              'Fuel with complex carbs 60-90 minutes before lifting.'
            ]
          } as any,
        });
      }
    }

    return plan;
  }

  async generateNutritionPlan(userId: string) {
    const [profile, user, activePlans] = await Promise.all([
      this.prisma.fitnessProfile.findUnique({ where: { userId } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      this.prisma.workoutPlan.findMany({
        where: { userId },
        take: 1,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const activePlan = activePlans[0];

    const payload = {
      athlete_name: user?.name || 'Athlete',
      weight_kg: profile?.weightKg || 75.0,
      height_cm: profile?.heightCm || 178.0,
      age: profile?.age || 26,
      gender: profile?.gender || 'Male',
      goals: profile?.goals || ['BUILD_MUSCLE'],
      workout_days_per_week: profile?.workoutDaysPerWeek || 4,
      session_duration_minutes: profile?.sessionDurationMinutes || 60,
      dietary_preference: 'No Preference',
      active_plan_name: activePlan?.name || null,
    };

    const response = await fetch(`${this.aiServiceUrl}/nutrition/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new InternalServerErrorException(`AI Nutrition Service error: ${errText}`);
    }

    const aiPlan = await response.json();

    return this.prisma.nutritionPlan.upsert({
      where: { userId },
      create: {
        userId,
        dailyCalories: aiPlan.daily_calories,
        proteinGrams: aiPlan.protein_grams,
        carbsGrams: aiPlan.carbs_grams,
        fatsGrams: aiPlan.fats_grams,
        waterMl: aiPlan.water_ml,
        dietaryStrategy: aiPlan.dietary_strategy,
        notes: aiPlan.notes,
        mealTimingTips: aiPlan.meal_timing_tips,
      },
      update: {
        dailyCalories: aiPlan.daily_calories,
        proteinGrams: aiPlan.protein_grams,
        carbsGrams: aiPlan.carbs_grams,
        fatsGrams: aiPlan.fats_grams,
        waterMl: aiPlan.water_ml,
        dietaryStrategy: aiPlan.dietary_strategy,
        notes: aiPlan.notes,
        mealTimingTips: aiPlan.meal_timing_tips,
      },
    });
  }

  async updateNutritionPlan(
    userId: string,
    dto: {
      dailyCalories?: number;
      proteinGrams?: number;
      carbsGrams?: number;
      fatsGrams?: number;
      waterMl?: number;
      notes?: string;
    },
  ) {
    const dataToUpdate: any = {};
    if (dto.dailyCalories !== undefined) dataToUpdate.dailyCalories = dto.dailyCalories;
    if (dto.proteinGrams !== undefined) dataToUpdate.proteinGrams = dto.proteinGrams;
    if (dto.carbsGrams !== undefined) dataToUpdate.carbsGrams = dto.carbsGrams;
    if (dto.fatsGrams !== undefined) dataToUpdate.fatsGrams = dto.fatsGrams;
    if (dto.waterMl !== undefined) dataToUpdate.waterMl = dto.waterMl;
    if (dto.notes !== undefined) dataToUpdate.notes = dto.notes;

    return this.prisma.nutritionPlan.upsert({
      where: { userId },
      create: {
        userId,
        dailyCalories: dto.dailyCalories || 2400,
        proteinGrams: dto.proteinGrams || 160,
        carbsGrams: dto.carbsGrams || 280,
        fatsGrams: dto.fatsGrams || 70,
        waterMl: dto.waterMl || 3000,
        notes: dto.notes,
      },
      update: dataToUpdate,
    });
  }

  async createMealLog(
    userId: string,
    data: {
      name: string;
      mealType: string;
      mealDate?: Date | string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      notes?: string;
    },
  ) {
    const mealDate = data.mealDate ? new Date(data.mealDate) : new Date();
    return this.prisma.mealLog.create({
      data: {
        userId,
        name: data.name,
        mealType: data.mealType,
        mealDate,
        calories: Number(data.calories) || 0,
        protein: Number(data.protein) || 0,
        carbs: Number(data.carbs) || 0,
        fats: Number(data.fats) || 0,
        notes: data.notes || null,
      },
    });
  }

  async getMealLogs(userId: string) {
    return this.prisma.mealLog.findMany({
      where: { userId },
      orderBy: { mealDate: 'desc' },
    });
  }

  async deleteMealLog(userId: string, logId: string) {
    const log = await this.prisma.mealLog.findFirst({
      where: { id: logId, userId },
    });
    if (!log) {
      throw new NotFoundException('Meal log not found or unauthorized');
    }
    return this.prisma.mealLog.delete({
      where: { id: logId },
    });
  }

  async getTodayMacroSummary(userId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [plan, todayLogs] = await Promise.all([
      this.prisma.nutritionPlan.findUnique({ where: { userId } }),
      this.prisma.mealLog.findMany({
        where: {
          userId,
          mealDate: { gte: todayStart },
        },
        orderBy: { mealDate: 'desc' },
      }),
    ]);

    const consumed = todayLogs.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fats: acc.fats + m.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );

    const targetCalories = plan?.dailyCalories || 2400;
    const targetProtein = plan?.proteinGrams || 160;
    const targetCarbs = plan?.carbsGrams || 280;
    const targetFats = plan?.fatsGrams || 70;

    return {
      plan,
      todayLogs,
      consumed,
      targets: {
        calories: targetCalories,
        protein: targetProtein,
        carbs: targetCarbs,
        fats: targetFats,
      },
      remaining: {
        calories: Math.max(0, targetCalories - consumed.calories),
        protein: Math.max(0, targetProtein - consumed.protein),
        carbs: Math.max(0, targetCarbs - consumed.carbs),
        fats: Math.max(0, targetFats - consumed.fats),
      },
    };
  }
}
