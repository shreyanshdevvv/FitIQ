import { IsArray, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { FitnessGoal, FitnessLevel } from '@prisma/client';

export class UpsertProfileDto {
  @IsEnum(FitnessLevel, { message: 'fitnessLevel must be BEGINNER, INTERMEDIATE, or ADVANCED' })
  fitnessLevel: FitnessLevel;

  @IsArray()
  @IsEnum(FitnessGoal, { each: true, message: 'Invalid fitness goal provided' })
  goals: FitnessGoal[];

  @IsArray()
  @IsString({ each: true })
  availableEquipment: string[];

  @IsInt()
  @Min(1)
  @Max(7)
  workoutDaysPerWeek: number;

  @IsInt()
  @Min(15)
  @Max(180)
  sessionDurationMinutes: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  injuriesOrLimitations?: string[] = [];
}
