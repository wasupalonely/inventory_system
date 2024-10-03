import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  // IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { LocationType } from 'src/shared/enums/location-type.enum';

export class CreateAddressDto {
  @ApiProperty({
    example: 'Calle real',
    description: 'Street name',
  })
  @IsString()
  @IsNotEmpty()
  streetName: string;

  @ApiProperty({
    example: '14A',
    description: 'Street number',
  })
  @IsString()
  @IsNotEmpty()
  streetNumber: string;

  @ApiProperty({
    example: 'Second Floor',
    description: 'Additional information',
  })
  @IsOptional()
  @IsString()
  additionalInfo?: string;

  @ApiProperty({
    example: 'street',
    description: 'Location type',
  })
  @IsEnum(LocationType, { message: 'Invalid location type' })
  locationType: LocationType;
  // city: string;
  // state: string;
  // zipCode?: string;
}

export class CreateSupermarketDto {
  @ApiProperty({ example: 'Supermarket', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  @IsNotEmpty()
  ownerId: number;

  @ApiProperty({ type: CreateAddressDto, required: true })
  @IsNotEmpty()
  @IsObject()
  address: CreateAddressDto;

  // @ApiProperty({ example: fasle, required: false })
  // @IsOptional()
  // @IsBoolean()
  // cronjobEnabled: boolean;
}

export class UpdateSupermarketDto extends PartialType(CreateSupermarketDto) {}
