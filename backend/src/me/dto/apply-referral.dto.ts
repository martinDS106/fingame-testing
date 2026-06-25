import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ApplyReferralDto {
  @ApiProperty({ example: 'A3K9Z', minLength: 5, maxLength: 5 })
  @IsString()
  @MinLength(5)
  @MaxLength(5)
  code!: string;
}
