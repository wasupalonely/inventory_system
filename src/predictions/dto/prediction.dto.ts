import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';
import { Label } from 'src/shared/types/prediction';

export class CreatePredictionDto {
  @IsUrl()
  @IsNotEmpty()
  @ApiProperty()
  image: string;

  @ApiProperty()
  @IsString()
  result: Label;

  @ApiProperty()
  @IsNumber()
  supermarketId: number;

  @ApiProperty()
  @IsNumber()
  fresh: number;

  @ApiProperty()
  @IsNumber()
  halfFresh: number;

  @ApiProperty()
  @IsNumber()
  spoiled: number;
}
export class UpdatePredictionDto extends PartialType(CreatePredictionDto) {}
