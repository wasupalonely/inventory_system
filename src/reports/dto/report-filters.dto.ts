import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ReportFiltersDto {
  @IsNumber()
  @Type(() => Number)
  supermarketId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  productId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
