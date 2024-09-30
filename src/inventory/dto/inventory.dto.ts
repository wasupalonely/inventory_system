import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateInventoryDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  supermarketId: number;

  @IsNumber()
  @IsNotEmpty()
  stock: number;
}

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {}
