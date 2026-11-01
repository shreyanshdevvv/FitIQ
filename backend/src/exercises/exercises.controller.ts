import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { ExerciseCategory, Difficulty } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  async listExercises(
    @Query('category') category?: ExerciseCategory,
    @Query('difficulty') difficulty?: Difficulty,
    @Query('search') search?: string,
  ) {
    return this.exercisesService.listExercises({ category, difficulty, search });
  }

  @Get(':id')
  async getExercise(@Param('id') id: string) {
    return this.exercisesService.getExerciseById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createExercise(@Body() dto: CreateExerciseDto) {
    return this.exercisesService.createExercise(dto);
  }
}
