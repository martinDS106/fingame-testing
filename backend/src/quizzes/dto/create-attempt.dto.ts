import { IsInt, Min } from 'class-validator';

export class CreateAttemptDto {
  @IsInt()
  @Min(0)
  score!: number;

  @IsInt()
  @Min(1)
  total!: number;
}
