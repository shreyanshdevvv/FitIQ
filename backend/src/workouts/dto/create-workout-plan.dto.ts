import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class PlanExerciseItemDto {
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @IsInt()
  @Min(1)
  dayNumber: number;

  @IsInt()
  @Min(1)
  orderInDay: number;

  @IsInt()
  @Min(1)
  sets: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  reps?: number;

  @IsOptional()
  @IsInt()
  durationSeconds?: number;

  @IsInt()
  @Min(0)
  restSeconds: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateWorkoutPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isAiGenerated?: boolean = false;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanExerciseItemDto)
  exercises: PlanExerciseItemDto[];
}
