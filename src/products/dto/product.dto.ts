import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    example: 'Banana',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Product description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    example: 1600,
    required: true,
  })
  @Transform(({ value }) => {
    if (value === '') return undefined;
    return Number(value);
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    example: 1600,
    required: true,
  })
  @Transform(({ value }) => {
    if (value === '') return undefined;
    return Number(value);
  })
  @IsNumber()
  @IsNotEmpty()
  unitCost: number;

  @ApiProperty({
    example: 10,
    required: true,
    description: 'The id of the category associated to the product',
  })
  @Transform(({ value }) => {
    if (value === '') return undefined;
    return Number(value);
  })
  @IsNumber()
  @IsOptional()
  categoryId: number;

  @ApiProperty({
    example: 1,
    required: true,
    description: 'The id of the supermarket associated to the product',
  })
  @Transform(({ value }) => {
    if (value === '') return undefined;
    return Number(value);
  })
  @IsNumber()
  @IsNotEmpty()
  supermarketId: number;
}

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['supermarketId'] as const),
  { skipNullProperties: true },
) {}
