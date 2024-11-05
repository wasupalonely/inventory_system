import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({
    example: 1,
    required: true,
    description: 'The id of the product',
  })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({
    example: 1,
    required: true,
    description: 'The id of the supermarket',
  })
  @IsNumber()
  @IsNotEmpty()
  supermarketId: number;

  @ApiProperty({
    example: 10,
    required: true,
  })
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
