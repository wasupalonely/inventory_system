import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsNumber,
  Length,
  Matches,
  IsEnum,
} from 'class-validator';
import { Role } from 'src/shared/enums/roles.enum';

export class AddUserToSupermarketDto {
  @ApiProperty({
    example: 'Mario',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Luigi',
    required: false,
  })
  @IsString()
  @IsOptional()
  middleName: string;

  @ApiProperty({
    example: 'Rossi',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'Rossi',
    required: false,
  })
  @IsString()
  @IsOptional()
  secondLastName: string;

  @ApiProperty({
    example: 'admin@test.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  supermarketId: number;

  @ApiProperty({
    example: '1234567890',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd1',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Length(9, 20)
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d).{9,20}$/, {
    message:
      'Password must have between 9 and 20 characters, have at least 1 uppercase letter, 1 number and 1 special character.',
  })
  password: string;

  @ApiProperty({ example: 'viewer' })
  @IsString()
  @IsEnum(Role, { message: 'Role must be either viewer, cashier or admin' })
  @IsOptional()
  role: Role;
}

export class UpdateUserNoAdminDto extends PartialType(
  OmitType(AddUserToSupermarketDto, ['password'] as const),
  {
    skipNullProperties: true,
  },
) {}
