import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { UpsertProfileDto } from './dto/upsert-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.profilesService.getMyProfile(userId);
  }

  @Post()
  async upsertProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpsertProfileDto,
  ) {
    return this.profilesService.upsertProfile(userId, dto);
  }

  @Patch()
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.updateProfile(userId, dto);
  }
}
