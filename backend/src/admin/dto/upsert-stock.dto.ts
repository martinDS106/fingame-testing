import { IsNumber, Min } from 'class-validator';

export class UpsertStockDto {
  @IsNumber()
  @Min(0.01)
  price!: number;
}
