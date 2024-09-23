import { PartialType } from '@nestjs/swagger';

export class CreatePredictionDto {
  supermarketId: number;
  fresh: number;
  halfFresh: number;
  soiled: number;
  fecha: Date;
}
export class UpdatePredictionDto extends PartialType(CreatePredictionDto) {}
