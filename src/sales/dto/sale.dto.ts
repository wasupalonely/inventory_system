import { PartialType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSaleDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  supermarketId: number;

  @IsArray()
  productQuantities: ProductQuantity[];

  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;
}

export interface ProductQuantity {
  productId: number;
  quantity: number;
}

export class UpdateSaleDto extends PartialType(CreateSaleDto) {}
