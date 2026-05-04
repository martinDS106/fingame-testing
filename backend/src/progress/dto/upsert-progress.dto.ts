import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpsertProgressDto {
  @IsIn(['course', 'simulation', 'lesson', 'quiz', 'video'])
  kind!: 'course' | 'simulation' | 'lesson' | 'quiz' | 'video';

  @IsString()
  refId!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  progress!: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
