import { Controller, Get, Post, Patch, Body, UseGuards, Request } from '@nestjs/common';
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
}
