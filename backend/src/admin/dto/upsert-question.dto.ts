import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertQuestionDto {
  @IsString()
  @MaxLength(120)
  id!: string;

  @IsString()
  @MaxLength(120)
  quizId!: string;

  @IsString()
  question!: string;

  @IsOptional()
  @IsString()
  questionAr?: string | null;

  @IsArray()
  options!: string[];

  @IsOptional()
  @IsArray()
  optionsAr?: string[] | null;

  @IsInt()
  @Min(0)
  @Max(1000)
  correctIndex!: number;

  @IsOptional()
  @IsString()
  explanation?: string | null;

  @IsOptional()
  @IsString()
  explanationAr?: string | null;

  @IsInt()
  @Min(0)
  @Max(10000)
  sortOrder!: number;
}
