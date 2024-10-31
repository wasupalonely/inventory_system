import { OmitType, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateInventoryDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  supermarketId: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @IsInt()
  stock: number;
}

export class UpdateInventoryDto extends PartialType(
  OmitType(CreateInventoryDto, ['productId', 'supermarketId'] as const),
  {
    skipNullProperties: true,
  },
) {}
