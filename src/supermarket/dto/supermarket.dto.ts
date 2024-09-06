import { PartialType } from '@nestjs/swagger';

export class CreateSupermarketDto {
  name: string;
  userId: number;
  address: CreateAddressDto;
}

export class UpdateSupermarketDto extends PartialType(CreateSupermarketDto) {}

export class CreateAddressDto {
  street: string;
  number: number;
  neighborhood: string;
  city: string;
  state: string;
  zipCode?: string;
}
