import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AppendCoinsDto {
  @IsInt()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  reason!: string;
}
