import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    let dbStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      dbStatus = 'disconnected: ' + (error as Error).message;
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      service: 'fitcoach-backend (NestJS)',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
