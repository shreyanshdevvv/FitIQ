import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('nutrition')
@UseGuards(JwtAuthGuard)
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get('me')
  async getMyPlan(@Request() req: any) {
    return this.nutritionService.getNutritionPlan(req.user.id);
  }

  @Post('generate')
  async generatePlan(@Request() req: any) {
    return this.nutritionService.generateNutritionPlan(req.user.id);
  }

  @Patch('me')
  async updatePlan(
    @Request() req: any,
    @Body()
    body: {
      dailyCalories?: number;
      proteinGrams?: number;
      carbsGrams?: number;
      fatsGrams?: number;
      waterMl?: number;
      notes?: string;
    },
  ) {
    return this.nutritionService.updateNutritionPlan(req.user.id, body);
  }

  @Get('logs')
  async getMealLogs(@Request() req: any) {
    return this.nutritionService.getMealLogs(req.user.id);
  }

  @Post('logs')
  async createMealLog(
    @Request() req: any,
    @Body()
    body: {
      name: string;
      mealType: string;
      mealDate?: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      notes?: string;
    },
  ) {
    return this.nutritionService.createMealLog(req.user.id, body);
  }

  @Delete('logs/:id')
  async deleteMealLog(@Request() req: any, @Param('id') id: string) {
    return this.nutritionService.deleteMealLog(req.user.id, id);
  }

  @Get('today-summary')
  async getTodaySummary(@Request() req: any) {
    return this.nutritionService.getTodayMacroSummary(req.user.id);
  }
}
