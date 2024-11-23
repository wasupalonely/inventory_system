import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  // IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { LocationType } from 'src/shared/enums/location-type.enum';
import { ScheduleFrequency } from 'src/shared/enums/schedule-frequency';

export class CreateAddressDto {
  @ApiProperty({
    example: 'Calle real',
    description: 'The neighborhood name',
  })
  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @ApiProperty({
    example: 'street',
    description: 'Location type',
  })
  @IsEnum(LocationType, { message: 'Invalid location type' })
  locationType: LocationType;

  @ApiProperty({
    example: '14A',
    description: 'Street number',
  })
  @IsString()
  @IsNotEmpty()
  streetNumber: string;

  @ApiProperty({
    example: '4W',
    description: 'Intersection number of the street',
  })
  @IsString()
  @IsOptional()
  intersectionNumber: string;

  @ApiProperty({
    example: '05',
    description: 'building street number',
  })
  @IsString()
  @IsOptional()
  buildingNumber: string;

  @ApiProperty({
    example: 'Second Floor',
    description: 'Additional information',
  })
  @IsOptional()
  @IsString()
  additionalInfo?: string;

  // city: string;
  // state: string;
  // zipCode?: string;
}

export class CreateSupermarketDto {
  @ApiProperty({ example: 'Supermarket', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123456789', required: true })
  @IsString()
  @IsNotEmpty()
  nit: string;

  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  @IsNotEmpty()
  ownerId: number;

  @ApiProperty({ type: CreateAddressDto, required: true })
  @IsNotEmpty()
  @IsObject()
  address: CreateAddressDto;

  @ApiProperty({ example: 'DAILY', default: 'EVERY_MINUTE' })
  @IsEnum(ScheduleFrequency, { message: 'Frecuencia no válida' })
  @IsOptional()
  scheduleFrequency: ScheduleFrequency;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  testModeUsed: boolean;

  // @ApiProperty({ example: fasle, required: false })
  // @IsOptional()
  // @IsBoolean()
  // cronjobEnabled: boolean;
}

export class UpdateSupermarketDto extends PartialType(CreateSupermarketDto) {}
