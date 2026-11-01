import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseFloatPipe,
} from '@nestjs/common';
import { CoachesService } from './coaches.service';
import { UpsertCoachProfileDto } from './dto/upsert-coach-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CoachSpecialization, Role } from '@prisma/client';

@Controller('coaches')
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @Get()
  async listCoaches(
    @Query('specialization') specialization?: CoachSpecialization,
    @Query('maxPrice') maxPrice?: string,
  ) {
    const parsedPrice = maxPrice ? parseFloat(maxPrice) : undefined;
    return this.coachesService.listCoaches(specialization, parsedPrice);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscriptions/my')
  async getMySubscriptions(@CurrentUser('id') userId: string) {
    return this.coachesService.getUserSubscriptions(userId);
  }

  @Get(':id')
  async getCoach(@Param('id') id: string) {
    return this.coachesService.getCoachById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COACH)
  @Post('profile')
  async upsertProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpsertCoachProfileDto,
  ) {
    return this.coachesService.upsertCoachProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/subscribe')
  async subscribe(
    @CurrentUser('id') userId: string,
    @Param('id') coachProfileId: string,
  ) {
    return this.coachesService.subscribeToCoach(userId, coachProfileId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('subscriptions/:id/cancel')
  async cancelSubscription(
    @CurrentUser('id') userId: string,
    @Param('id') subscriptionId: string,
  ) {
    return this.coachesService.cancelSubscription(userId, subscriptionId);
  }
}
