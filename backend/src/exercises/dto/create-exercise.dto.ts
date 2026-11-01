import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Difficulty, ExerciseCategory } from '@prisma/client';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ExerciseCategory)
  category: ExerciseCategory;

  @IsArray()
  @IsString({ each: true })
  muscleGroups: string[];

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsArray()
  @IsString({ each: true })
  equipmentNeeded: string[];

  @IsString()
  @IsNotEmpty()
  instructions: string;
}
