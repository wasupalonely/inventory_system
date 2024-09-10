import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAddressDto {
  street: string;
  number: number;
  neighborhood: string;
  city: string;
  state: string;
  zipCode?: string;
}

export class CreateSupermarketDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  ownerId: number;

  @IsNotEmpty()
  address: CreateAddressDto;

  @IsOptional()
  @IsBoolean()
  cronjobEnabled: boolean;
}

export class UpdateSupermarketDto extends PartialType(CreateSupermarketDto) {}
