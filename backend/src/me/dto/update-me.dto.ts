import {
  IsArray,
  IsIn,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const GENDERS = ['male', 'female', 'other'] as const;
const USER_TYPES = ['student', 'employed', 'both'] as const;
const INCOME_RANGES = ['lt_3000', '3000_5000', '5000_10000', 'gt_10000'] as const;
const FINANCIAL_GOALS = ['saving', 'investing', 'learning', 'business'] as const;
const FINANCIAL_LITERACY = ['beginner', 'intermediate', 'advanced'] as const;

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  avatar?: string;

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
  lastActiveDate?: string;

  @IsOptional()
  @IsISO8601()
  dateOfBirth?: string | null;

  @IsOptional()
  @IsIn(GENDERS)
  gender?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  mobile?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  governorate?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string | null;

  @IsOptional()
  @IsIn(USER_TYPES)
  userType?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  schoolName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  facultyMajor?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  academicYear?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  employer?: string | null;

  @IsOptional()
  @IsIn(INCOME_RANGES)
  monthlyIncomeRange?: string | null;

  @IsOptional()
  @IsArray()
  @IsIn(FINANCIAL_GOALS, { each: true })
  financialGoals?: string[];

  @IsOptional()
  @IsIn(FINANCIAL_LITERACY)
  financialLiteracy?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  persona?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  parentEmail?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  parentPhone?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  referredByCode?: string | null;

  @IsOptional()
  @IsISO8601()
  profileCompletedAt?: string | null;
}
