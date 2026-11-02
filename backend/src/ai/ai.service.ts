import { Injectable, BadGatewayException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { WorkoutsService } from '../workouts/workouts.service';
import { ConversationType, MessageRole } from '@prisma/client';

@Injectable()
export class AiService {
  private readonly aiBaseUrl: string;
  private readonly internalApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly workoutsService: WorkoutsService,
  ) {
    this.aiBaseUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
    this.internalApiKey = this.configService.get<string>('AI_SERVICE_API_KEY') || 'dev-internal-secret-token';
  }

  private getHeaders() {
    return {
      'X-Internal-API-Key': this.internalApiKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generates an AI Workout Plan based on user fitness profile & exercises library,
   * then saves it directly into the database as a WorkoutPlan.
   */
  async generateWorkoutPlan(userId: string, preferences?: { focusAreas?: string[]; notes?: string }) {
    const profile = await this.prisma.fitnessProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Please complete your fitness profile before generating an AI workout plan.');
    }

    const availableExercises = await this.prisma.exercise.findMany({
      select: { id: true, name: true, category: true, muscleGroups: true, difficulty: true, equipmentNeeded: true },
    });

    const payload = {
      user_profile: {
        fitness_level: profile.fitnessLevel,
        goals: profile.goals,
        available_equipment: profile.availableEquipment,
        workout_days_per_week: profile.workoutDaysPerWeek,
        session_duration_minutes: profile.sessionDurationMinutes,
        injuries_or_limitations: profile.injuriesOrLimitations,
      },
      available_exercises: availableExercises,
      preferences: preferences || {},
    };

    let aiResponse: any;
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiBaseUrl}/api/v1/generate/workout`, payload, {
          headers: this.getHeaders(),
          timeout: 45000,
        }),
      );
      aiResponse = response.data;
    } catch (error: any) {
      throw new BadGatewayException(
        `AI Service error: ${error.response?.data?.detail || error.message}`,
      );
    }

    // Transform structured AI output into our Prisma WorkoutPlan model
    const planExercises: any[] = [];
    if (Array.isArray(aiResponse.days)) {
      aiResponse.days.forEach((day: any) => {
        if (Array.isArray(day.exercises)) {
          day.exercises.forEach((ex: any, idx: number) => {
            planExercises.push({
              exerciseId: ex.exercise_id,
              dayNumber: day.day_number,
              orderInDay: idx + 1,
              sets: ex.sets || 3,
              reps: ex.reps || 10,
              durationSeconds: ex.duration_seconds || null,
              restSeconds: ex.rest_seconds || 60,
              notes: ex.notes || null,
            });
          });
        }
      });
    }

    const savedPlan = await this.prisma.workoutPlan.create({
      data: {
        userId,
        name: aiResponse.plan_name || 'AI Personalized Workout Plan',
        description: aiResponse.description || 'Generated based on your profile',
        isAiGenerated: true,
        aiMetadata: aiResponse.usage || {},
        exercises: {
          create: planExercises,
        },
      },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: [{ dayNumber: 'asc' }, { orderInDay: 'asc' }],
        },
      },
    });

    return {
      message: 'AI workout plan generated and saved successfully',
      plan: savedPlan,
    };
  }

  /**
   * Chat with the AI Fitness Assistant (persisting message history in DB)
   */
  async chatWithAssistant(userId: string, message: string, conversationId?: string) {
    let conversation = conversationId
      ? await this.prisma.conversation.findFirst({
          where: { id: conversationId, userId },
          include: { messages: { orderBy: { createdAt: 'asc' }, take: 10 } },
        })
      : null;

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          userId,
          type: ConversationType.ASSISTANT,
          title: message.substring(0, 50),
        },
        include: { messages: true },
      });
    }

    // Save user message
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: MessageRole.USER,
        content: message,
      },
    });

    // Assemble complete profile context, active workout plan, active nutrition plan & today's meal logs
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [profile, recentLogs, activePlans, user, nutrition, todayMealLogs] = await Promise.all([
      this.prisma.fitnessProfile.findUnique({ where: { userId } }),
      this.prisma.workoutLog.findMany({
        where: { userId },
        take: 3,
        orderBy: { workoutDate: 'desc' },
        include: { exercises: { include: { exercise: true } } },
      }),
      this.prisma.workoutPlan.findMany({
        where: { userId },
        take: 1,
        orderBy: { updatedAt: 'desc' },
        include: { exercises: { include: { exercise: true } } },
      }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      this.prisma.nutritionPlan.findUnique({ where: { userId } }),
      this.prisma.mealLog.findMany({
        where: {
          userId,
          mealDate: { gte: todayStart },
        },
        orderBy: { mealDate: 'desc' },
      }),
    ]);

    const activePlan = activePlans[0];

    const todayConsumed = todayMealLogs.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fats: acc.fats + m.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );

    const targetCalories = nutrition?.dailyCalories || 2400;
    const targetProtein = nutrition?.proteinGrams || 160;
    const targetCarbs = nutrition?.carbsGrams || 280;
    const targetFats = nutrition?.fatsGrams || 70;

    const payload = {
      message,
      conversation_history: conversation.messages.map((m) => ({
        role: m.role.toLowerCase(),
        content: m.content,
      })),
      user_context: {
        name: user?.name || 'Athlete',
        fitness_level: profile?.fitnessLevel || 'BEGINNER',
        goals: profile?.goals || [],
        available_equipment: profile?.availableEquipment || [],
        workout_days_per_week: profile?.workoutDaysPerWeek || 4,
        session_duration_minutes: profile?.sessionDurationMinutes || 60,
        injuries_and_limitations: profile?.injuriesOrLimitations || [],
        height_cm: profile?.heightCm || null,
        weight_kg: profile?.weightKg || null,
        age: profile?.age || null,
        gender: profile?.gender || null,
        recent_workouts_logged: recentLogs.length,
        active_plan_name: activePlan?.name || null,
        active_plan_description: activePlan?.description || null,
        active_plan_exercises: activePlan?.exercises.map(
          (e) => `${e.exercise.name} (Day ${e.dayNumber}: ${e.sets} sets x ${e.reps || 10} reps)`
        ).slice(0, 15) || [],
        nutrition_plan: nutrition
          ? {
              daily_calories: nutrition.dailyCalories,
              protein_grams: nutrition.proteinGrams,
              carbs_grams: nutrition.carbsGrams,
              fats_grams: nutrition.fatsGrams,
              water_ml: nutrition.waterMl,
              strategy: nutrition.dietaryStrategy,
              notes: nutrition.notes,
            }
          : null,
        today_macro_consumption: {
          calories: todayConsumed.calories,
          protein: todayConsumed.protein,
          carbs: todayConsumed.carbs,
          fats: todayConsumed.fats,
          meals_count: todayMealLogs.length,
          target_calories: targetCalories,
          target_protein: targetProtein,
          target_carbs: targetCarbs,
          target_fats: targetFats,
          remaining_calories: Math.max(0, targetCalories - todayConsumed.calories),
          remaining_protein: Math.max(0, targetProtein - todayConsumed.protein),
          remaining_carbs: Math.max(0, targetCarbs - todayConsumed.carbs),
          remaining_fats: Math.max(0, targetFats - todayConsumed.fats),
          recent_meals: todayMealLogs.map(
            (m) => `${m.name} (${m.mealType}: ${m.calories} kcal, ${m.protein}g P, ${m.carbs}g C, ${m.fats}g F)`
          ),
        },
      },
      use_rag: true,
    };

    let aiResult: any;
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiBaseUrl}/api/v1/chat`, payload, {
          headers: this.getHeaders(),
          timeout: 45000,
        }),
      );
      aiResult = response.data;
    } catch (error: any) {
      throw new BadGatewayException(`AI Assistant error: ${error.response?.data?.detail || error.message}`);
    }

    // Save AI response
    const assistantMessage = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: MessageRole.ASSISTANT,
        content: aiResult.response,
        metadata: {
          sources: aiResult.sources || [],
          usage: aiResult.usage || {},
        },
      },
    });

    return {
      conversationId: conversation.id,
      response: assistantMessage.content,
      sources: aiResult.sources || [],
    };
  }

  /**
   * Analyzes deterministic workout stats and gets an AI-synthesized Weekly Progress Report
   */
  async generateWeeklySummary(userId: string) {
    const stats = await this.workoutsService.getWeeklyDeterministicStats(userId);
    const profile = await this.prisma.fitnessProfile.findUnique({ where: { userId } });

    const payload = {
      user_profile: profile || {},
      stats: {
        planned_sessions: stats.plannedSessions,
        completed_sessions: stats.completedSessions,
        adherence_percentage: stats.adherencePercentage,
        total_duration_minutes: stats.totalDurationMinutes,
        most_trained_muscles: stats.mostTrainedMuscles,
      },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiBaseUrl}/api/v1/summary/weekly`, payload, {
          headers: this.getHeaders(),
          timeout: 45000,
        }),
      );

      return {
        deterministicStats: stats,
        aiSummary: response.data,
      };
    } catch (error: any) {
      throw new BadGatewayException(`AI Summary error: ${error.response?.data?.detail || error.message}`);
    }
  }

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
