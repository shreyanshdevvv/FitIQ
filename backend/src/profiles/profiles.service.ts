import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertProfileDto } from './dto/upsert-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
        age: dto.age,
        gender: dto.gender,
      },
      update: {
        fitnessLevel: dto.fitnessLevel,
        goals: dto.goals,
        availableEquipment: dto.availableEquipment,
        workoutDaysPerWeek: dto.workoutDaysPerWeek,
        sessionDurationMinutes: dto.sessionDurationMinutes,
        injuriesOrLimitations: dto.injuriesOrLimitations || [],
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
        age: dto.age,
        gender: dto.gender,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.name && dto.name.trim()) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { name: dto.name.trim() },
      });
    }

    const dataToUpdate: any = {};
    if (dto.fitnessLevel !== undefined) dataToUpdate.fitnessLevel = dto.fitnessLevel;
    if (dto.goals !== undefined) dataToUpdate.goals = dto.goals;
    if (dto.availableEquipment !== undefined) dataToUpdate.availableEquipment = dto.availableEquipment;
    if (dto.workoutDaysPerWeek !== undefined) dataToUpdate.workoutDaysPerWeek = dto.workoutDaysPerWeek;
    if (dto.sessionDurationMinutes !== undefined) dataToUpdate.sessionDurationMinutes = dto.sessionDurationMinutes;
    if (dto.injuriesOrLimitations !== undefined) dataToUpdate.injuriesOrLimitations = dto.injuriesOrLimitations;
    if (dto.heightCm !== undefined) dataToUpdate.heightCm = dto.heightCm;
    if (dto.weightKg !== undefined) dataToUpdate.weightKg = dto.weightKg;
    if (dto.age !== undefined) dataToUpdate.age = dto.age;
    if (dto.gender !== undefined) dataToUpdate.gender = dto.gender;

    return this.prisma.fitnessProfile.upsert({
      where: { userId },
      create: {
        userId,
        fitnessLevel: dto.fitnessLevel || 'BEGINNER',
        goals: dto.goals || ['GENERAL_FITNESS'],
        availableEquipment: dto.availableEquipment || ['Full Gym'],
        workoutDaysPerWeek: dto.workoutDaysPerWeek || 4,
        sessionDurationMinutes: dto.sessionDurationMinutes || 60,
        injuriesOrLimitations: dto.injuriesOrLimitations || [],
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
        age: dto.age,
        gender: dto.gender,
      },
      update: dataToUpdate,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }
}
