import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { CreateWorkoutLogDto } from './dto/create-workout-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post('plans')
  async createPlan(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorkoutPlanDto,
  ) {
    return this.workoutsService.createPlan(userId, dto);
  }

  @Get('plans')
  async getMyPlans(@CurrentUser('id') userId: string) {
    return this.workoutsService.getMyPlans(userId);
  }

  @Get('plans/:id')
  async getPlanById(
    @CurrentUser('id') userId: string,
    @Param('id') planId: string,
  ) {
    return this.workoutsService.getPlanById(userId, planId);
  }

  @Post('logs')
  async createLog(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorkoutLogDto,
  ) {
    return this.workoutsService.createLog(userId, dto);
  }

  @Get('logs')
  async getMyLogs(@CurrentUser('id') userId: string) {
    return this.workoutsService.getMyLogs(userId);
  }

  @Get('stats/weekly')
  async getWeeklyStats(@CurrentUser('id') userId: string) {
    return this.workoutsService.getWeeklyDeterministicStats(userId);
  }
}
