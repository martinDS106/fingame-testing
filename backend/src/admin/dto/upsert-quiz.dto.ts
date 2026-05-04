import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertQuizDto {
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
  category!: string;

  @IsString()
  @MaxLength(32)
  difficulty!: string;

  @IsInt()
  @Min(0)
  @Max(1000000)
  coinReward!: number;
}
