import { IsNotEmpty } from 'class-validator';

export class LoginAuthDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
