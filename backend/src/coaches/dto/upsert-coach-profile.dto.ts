import { IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CoachSpecialization } from '@prisma/client';

export class UpsertCoachProfileDto {
  @IsString()
  bio: string;

  @IsArray()
  @IsEnum(CoachSpecialization, { each: true })
  specializations: CoachSpecialization[];

  @IsInt()
  @Min(0)
  experienceYears: number;

  @IsArray()
  @IsString({ each: true })
  certifications: string[];

  @IsNumber()
  @Min(1)
  monthlyPriceUsd: number;

  @IsOptional()
  @IsBoolean()
  isAcceptingClients?: boolean = true;

  @IsOptional()
  @IsString()
  profileImageUrl?: string;
}
