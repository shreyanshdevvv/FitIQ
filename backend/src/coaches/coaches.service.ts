import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertCoachProfileDto } from './dto/upsert-coach-profile.dto';
import { CoachSpecialization, SubscriptionStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class CoachesService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertCoachProfile(userId: string, dto: UpsertCoachProfileDto) {
    return this.prisma.coachProfile.upsert({
      where: { userId },
      create: {
        userId,
        bio: dto.bio,
        specializations: dto.specializations,
        experienceYears: dto.experienceYears,
        certifications: dto.certifications,
        monthlyPriceUsd: dto.monthlyPriceUsd,
        isAcceptingClients: dto.isAcceptingClients ?? true,
        profileImageUrl: dto.profileImageUrl,
      },
      update: {
        bio: dto.bio,
        specializations: dto.specializations,
        experienceYears: dto.experienceYears,
        certifications: dto.certifications,
        monthlyPriceUsd: dto.monthlyPriceUsd,
        isAcceptingClients: dto.isAcceptingClients ?? true,
        profileImageUrl: dto.profileImageUrl,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async listCoaches(specialization?: CoachSpecialization, maxPrice?: number) {
    const where: any = {
      isAcceptingClients: true,
    };

    if (specialization) {
      where.specializations = { has: specialization };
    }

    if (maxPrice) {
      where.monthlyPriceUsd = { lte: maxPrice };
    }

    return this.prisma.coachProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { subscriptions: true },
        },
      },
      orderBy: { experienceYears: 'desc' },
    });
  }

  async getCoachById(id: string) {
    const coach = await this.prisma.coachProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        subscriptions: {
          where: { status: SubscriptionStatus.ACTIVE },
          select: { id: true },
        },
      },
    });

    if (!coach) {
      throw new NotFoundException('Coach profile not found');
    }

    return {
      ...coach,
      activeClientsCount: coach.subscriptions.length,
    };
  }

  async subscribeToCoach(userId: string, coachProfileId: string) {
    const coach = await this.prisma.coachProfile.findUnique({
      where: { id: coachProfileId },
      include: { user: true },
    });

    if (!coach) {
      throw new NotFoundException('Coach profile not found');
    }

    if (coach.userId === userId) {
      throw new BadRequestException('You cannot subscribe to your own coaching service');
    }

    if (!coach.isAcceptingClients) {
      throw new BadRequestException('This coach is currently not accepting new clients');
    }

    // Check if user already has an active subscription to this coach
    const existing = await this.prisma.subscription.findFirst({
      where: {
        userId,
        coachProfileId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existing) {
      throw new ConflictException('You already have an active subscription with this coach');
    }

    // Generate mock payment details
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30); // 30-day subscription

    const mockTransactionId = `mock_tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        coachProfileId,
        status: SubscriptionStatus.ACTIVE,
        paymentStatus: PaymentStatus.MOCK_PAID,
        startDate,
        endDate,
        amountPaid: coach.monthlyPriceUsd,
        mockTransactionId,
      },
      include: {
        coachProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return {
      message: 'Subscription purchased successfully (Mock Payment)',
      subscription,
    };
  }

  async getUserSubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: {
        coachProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelSubscription(userId: string, subscriptionId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: SubscriptionStatus.CANCELLED },
    });
  }
}
