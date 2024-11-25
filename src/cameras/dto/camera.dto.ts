// src/supermarket/dto/create-camera.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCameraDto {
  @ApiProperty({
    example: 'Camera 1',
    description: 'Name or identifier for the camera',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Over the meat section',
    description: 'Description of where the camera is located',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the camera is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: 1,
    description: 'ID of the supermarket to which this camera belongs',
  })
  @IsNotEmpty()
  @IsNumber()
  supermarketId: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the category (meat cut) this camera monitors',
  })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;
}

export class UpdateCameraDto extends PartialType(CreateCameraDto) {}
