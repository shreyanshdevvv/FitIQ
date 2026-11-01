import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { ExerciseCategory, Difficulty } from '@prisma/client';

@Injectable()
export class ExercisesService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedExercisesIfEmpty();
  }

  async seedExercisesIfEmpty() {
    const count = await this.prisma.exercise.count();
    if (count > 0) return;

    const seedData: CreateExerciseDto[] = [
      {
        name: 'Barbell Bench Press',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: ['chest', 'shoulders', 'triceps'],
        difficulty: Difficulty.INTERMEDIATE,
        equipmentNeeded: ['barbell', 'bench'],
        instructions: 'Lie on flat bench. Lower bar with control to mid-chest, then press forcefully until arms are extended.',
      },
      {
        name: 'Dumbbell Incline Bench Press',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: ['upper chest', 'shoulders', 'triceps'],
        difficulty: Difficulty.BEGINNER,
        equipmentNeeded: ['dumbbells', 'incline bench'],
        instructions: 'Set bench to 30-45 degrees. Press dumbbells overhead, keep elbows at a 45-degree angle.',
      },
      {
        name: 'Barbell Back Squat',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings', 'core'],
        difficulty: Difficulty.INTERMEDIATE,
        equipmentNeeded: ['barbell', 'squat rack'],
        instructions: 'Place bar across upper traps. Squat down until thighs are parallel to the floor, drive back up through midfoot.',
      },
      {
        name: 'Romanian Deadlift (RDL)',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: ['hamstrings', 'glutes', 'lower back'],
        difficulty: Difficulty.INTERMEDIATE,
        equipmentNeeded: ['barbell', 'dumbbells'],
        instructions: 'Hinge at the hips with a slight knee bend. Lower weight along shins until you feel a deep hamstring stretch, then drive hips forward.',
      },
      {
        name: 'Pull-Up',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: ['lats', 'upper back', 'biceps'],
        difficulty: Difficulty.ADVANCED,
        equipmentNeeded: ['pull-up bar'],
        instructions: 'Grip bar with overhand grip wider than shoulders. Pull chest up towards bar, squeeze shoulder blades.',
      },
      {
        name: 'Push-Up',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: ['chest', 'triceps', 'core'],
        difficulty: Difficulty.BEGINNER,
        equipmentNeeded: ['bodyweight'],
        instructions: 'Maintain a rigid plank line. Lower chest to floor and push back up.',
      },
      {
        name: 'Dumbbell Bicep Curl',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: ['biceps'],
        difficulty: Difficulty.BEGINNER,
        equipmentNeeded: ['dumbbells'],
        instructions: 'Stand upright. Curl dumbbells upwards while keeping elbows fixed at your sides.',
      },
      {
        name: 'Tricep Cable Pushdown',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: ['triceps'],
        difficulty: Difficulty.BEGINNER,
        equipmentNeeded: ['cable machine'],
        instructions: 'Push rope/bar down until elbows are fully locked, squeeze triceps, return slowly.',
      },
      {
        name: 'Plank',
        category: ExerciseCategory.BALANCE,
        muscleGroups: ['core', 'abdominals', 'lower back'],
        difficulty: Difficulty.BEGINNER,
        equipmentNeeded: ['bodyweight', 'mat'],
        instructions: 'Support body on forearms and toes. Keep spine neutral and brace core tight for the full duration.',
      },
      {
        name: 'HIIT Treadmill Sprints',
        category: ExerciseCategory.CARDIO,
        muscleGroups: ['full body', 'legs', 'cardiovascular'],
        difficulty: Difficulty.ADVANCED,
        equipmentNeeded: ['treadmill'],
        instructions: 'Perform 30s maximum sprint followed by 60s walking recovery. Repeat for 10-15 rounds.',
      },
      {
        name: 'Rowing Machine Intervals',
        category: ExerciseCategory.CARDIO,
        muscleGroups: ['back', 'legs', 'cardiovascular'],
        difficulty: Difficulty.INTERMEDIATE,
        equipmentNeeded: ['rower'],
        instructions: 'Drive through heels, lean slightly back, pull handle to chest. Repeat with fluid cadence.',
      },
      {
        name: 'Cat-Cow Stretch',
        category: ExerciseCategory.FLEXIBILITY,
        muscleGroups: ['spine', 'neck', 'core'],
        difficulty: Difficulty.BEGINNER,
        equipmentNeeded: ['mat', 'bodyweight'],
        instructions: 'On all fours, inhale as you arch back (Cow), exhale as you round spine up towards ceiling (Cat).',
      },
    ];

    for (const item of seedData) {
      await this.prisma.exercise.upsert({
        where: { name: item.name },
        create: item,
        update: {},
      });
    }
  }

  async listExercises(filters?: {
    category?: ExerciseCategory;
    difficulty?: Difficulty;
    search?: string;
  }) {
    const where: any = {};
    if (filters?.category) where.category = filters.category;
    if (filters?.difficulty) where.difficulty = filters.difficulty;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { muscleGroups: { has: filters.search.toLowerCase() } },
      ];
    }

    return this.prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async getExerciseById(id: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
    });
    if (!exercise) throw new NotFoundException('Exercise not found');
    return exercise;
  }

  async createExercise(dto: CreateExerciseDto) {
    return this.prisma.exercise.create({
      data: dto,
    });
  }
}
