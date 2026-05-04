import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertLessonDto {
  @IsString()
  @MaxLength(120)
  id!: string;

  @IsString()
  @MaxLength(120)
  courseId!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  titleAr?: string | null;

  @IsOptional()
  @IsString()
  summary?: string | null;

  @IsOptional()
  @IsString()
  summaryAr?: string | null;

  @IsInt()
  @Min(0)
  @Max(100000)
  durationMinutes!: number;

  @IsInt()
  @Min(0)
  @Max(10000)
  sortOrder!: number;
}
