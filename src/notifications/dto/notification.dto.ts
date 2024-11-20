import { OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsNumber()
  @IsNotEmpty()
  supermarketId: number;
}

export class UpdateNotificationDto extends PartialType(
  OmitType(CreateNotificationDto, ['supermarketId'] as const),
  {
    skipNullProperties: true,
  },
) {}
