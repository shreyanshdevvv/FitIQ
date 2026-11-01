import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsArray, IsOptional, IsString } from 'class-validator';

class GenerateWorkoutDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focusAreas?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

class ChatDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-workout')
  async generateWorkout(
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateWorkoutDto,
  ) {
    return this.aiService.generateWorkoutPlan(userId, dto);
  }

  @Post('chat')
  async chat(
    @CurrentUser('id') userId: string,
    @Body() dto: ChatDto,
  ) {
    return this.aiService.chatWithAssistant(userId, dto.message, dto.conversationId);
  }

  @Get('conversations')
  async getConversations(@CurrentUser('id') userId: string) {
    return this.aiService.getConversations(userId);
  }

  @Post('weekly-summary')
  async getWeeklySummary(@CurrentUser('id') userId: string) {
    return this.aiService.generateWeeklySummary(userId);
  }
}
