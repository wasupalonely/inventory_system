import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Custom Meat Cut',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Custom meat cut',
    required: false,
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    example: 1,
    required: true,
    description: 'The id of the supermarket associated to the category',
  })
  @IsNumber()
  @IsNotEmpty()
  supermarketId: number;
}

export class UpdateCategoryDto extends PartialType(
  OmitType(CreateCategoryDto, ['supermarketId'] as const),
  {
    skipNullProperties: true,
  },
) {}
