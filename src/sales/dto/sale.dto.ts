import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSaleDto {
  @ApiProperty({
    example: 1,
    required: true,
    description: 'The id of the user',
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: 1,
    required: true,
    description: 'The id of the supermarket',
  })
  @IsNumber()
  @IsNotEmpty()
  supermarketId: number;

  @ApiProperty({
    example: [
      {
        productId: 1,
        quantity: 10,
      },
      {
        productId: 2,
        quantity: 5,
      },
    ],
    required: true,
    description: 'The id of the products and their quantities',
  })
  @IsArray()
  productQuantities: ProductQuantity[];
}

export interface ProductQuantity {
  productId: number;
  quantity: number;
}

export class UpdateSaleDto extends PartialType(CreateSaleDto) {}
