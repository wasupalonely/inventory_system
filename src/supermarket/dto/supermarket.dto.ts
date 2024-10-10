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
    description: 'The neighborhood name',
  })
  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @ApiProperty({
    example: 'calle',
    description: 'Tipo de ubicación',
  })
  @IsEnum(LocationType, { message: 'Tipo de ubicación no válido' })
  locationType: LocationType;

  @ApiProperty({
    example: '14A',
    description: 'Número de la calle',
  })
  @IsString()
  @IsNotEmpty()
  streetNumber: string;

  @ApiProperty({
    example: '4W',
    description: 'Número de intersección de la calle',
  })
  @IsString()
  @IsOptional()
  intersectionNumber: string;

  @ApiProperty({
    example: '05',
    description: 'número de la calle del edificio',
  })
  @IsString()
  @IsOptional()
  buildingNumber: string;

  @ApiProperty({
    example: 'Segundo piso',
    description: 'Información complementaria',
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
