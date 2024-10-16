import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ example: 'Xy9g9@example.com', required: true })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', required: true })
  @IsNotEmpty()
  password: string;
}
