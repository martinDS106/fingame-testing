import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  avatar?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  level?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2_000_000_000)
  coins?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2_000_000_000)
  xp?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  streak?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  longestStreak?: number;

  @IsOptional()
  @IsISO8601()
  lastActiveDate?: string | null;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}
