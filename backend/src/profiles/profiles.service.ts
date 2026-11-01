import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertProfileDto } from './dto/upsert-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const profile = await this.prisma.fitnessProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Fitness profile not found. Please create one.');
    }

    return profile;
  }

  async upsertProfile(userId: string, dto: UpsertProfileDto) {
    return this.prisma.fitnessProfile.upsert({
      where: { userId },
      create: {
        userId,
        fitnessLevel: dto.fitnessLevel,
        goals: dto.goals,
        availableEquipment: dto.availableEquipment,
        workoutDaysPerWeek: dto.workoutDaysPerWeek,
        sessionDurationMinutes: dto.sessionDurationMinutes,
        injuriesOrLimitations: dto.injuriesOrLimitations || [],
      },
      update: {
        fitnessLevel: dto.fitnessLevel,
        goals: dto.goals,
        availableEquipment: dto.availableEquipment,
        workoutDaysPerWeek: dto.workoutDaysPerWeek,
        sessionDurationMinutes: dto.sessionDurationMinutes,
        injuriesOrLimitations: dto.injuriesOrLimitations || [],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}
