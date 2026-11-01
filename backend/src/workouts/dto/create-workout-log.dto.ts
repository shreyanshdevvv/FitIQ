import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { PerceivedDifficulty } from '@prisma/client';

export class LogExerciseItemDto {
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @IsInt()
  @Min(1)
  setsCompleted: number;

  @IsOptional()
  @IsInt()
  repsCompleted?: number;

  @IsOptional()
  @IsNumber()
  weightUsed?: number;

  @IsOptional()
  @IsInt()
  durationSeconds?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateWorkoutLogDto {
  @IsOptional()
  @IsString()
  planId?: string;

  @IsDateString()
  workoutDate: string;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsEnum(PerceivedDifficulty)
  perceivedDifficulty: PerceivedDifficulty;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogExerciseItemDto)
  exercises: LogExerciseItemDto[];
}
