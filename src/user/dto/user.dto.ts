import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Role } from 'src/shared/enums/roles.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'Mario',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

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
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  ownedSupermarketId: number;

  @ApiProperty({
    example: '1234567890',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd',
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

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isConfirmed: boolean;

  @ApiProperty({ example: 'viewer' })
  @IsString()
  @IsOptional()
  role: Role;
}

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
  {
    skipNullProperties: true,
  },
) {}
