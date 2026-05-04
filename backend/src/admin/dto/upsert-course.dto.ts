import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertCourseDto {
  @IsString()
  @MaxLength(120)
  id!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  titleAr?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  descriptionAr?: string | null;

  @IsString()
  @MaxLength(32)
  topic!: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  icon?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  color?: string | null;

  @IsInt()
  @Min(0)
  @Max(10000)
  sortOrder!: number;

  @IsInt()
  @Min(0)
  @Max(1000000)
  coinReward!: number;
}
