import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Label } from 'src/shared/types/prediction';

export class CreatePredictionDto {
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
