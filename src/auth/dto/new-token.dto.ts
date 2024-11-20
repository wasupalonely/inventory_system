import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Role } from 'src/shared/enums/roles.enum';

export class NewTokenDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  supermarketId: number;

  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  role: Role;
}
