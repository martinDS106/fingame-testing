import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertVideoDto {
  @IsString()
  @MaxLength(120)
  id!: string;

  @IsString()
  @MaxLength(120)
  lessonId!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  titleAr?: string | null;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  thumbnail?: string | null;

  @IsInt()
  @Min(0)
  @Max(1000000)
  durationSeconds!: number;

  @IsInt()
  @Min(0)
  @Max(10000)
  sortOrder!: number;
}
