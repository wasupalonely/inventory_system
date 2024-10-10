// src/auth/auth.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { MailService } from 'src/mail/mail.service';
import { Role } from 'src/shared/enums/roles.enum';
import { CreateUserDto } from 'src/user/dto/user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { LoginAuthDto } from './dto/login.dto';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private mailService: MailService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(email: string, password: string): Promise<Partial<User>> {
    const user = await this.usersService.getUserByIdentifier(email);
    if (user && bcrypt.compareSync(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: LoginAuthDto) {
    const userValidation = await this.validateUser(user.email, user.password);

    if (!userValidation) {
      throw new BadRequestException('Invalid credentials for login');
    }

    if (!userValidation.isConfirmed) {
      throw new BadRequestException('Account not confirmed');
    }

    const payload = {
      email: userValidation.email,
      sub: userValidation.id,
      role: userValidation.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: userValidation,
    };
  }

  async register(userDto: CreateUserDto) {
    const userValidation = await this.usersService.validateUserExistence(
      userDto.email,
    );
    if (userValidation) {
      throw new BadRequestException('User already exists');
    }

    if (userDto.role !== Role.Owner) {
      throw new BadRequestException('Solo se puede registrar el rol dueño');
    }

    userDto.password = bcrypt.hashSync(userDto.password, 10);
    const user = await this.usersService.create(userDto);

    const confirmationToken = this.jwtService.sign({ email: user.email });

    await this.tokenService.createToken(user.email, confirmationToken);

    const confirmationUrl = `${this.configService.get('CLIENT_URL')}/auth/confirm?token=${confirmationToken}`;

    // Cambios aquí: Pasamos el tipo de plantilla y el URL a `mail.service.ts`
    await this.mailService.sendMail(
      user.email,
      'Confirm your account',
      confirmationUrl,  // URL para el correo de confirmación
      'confirm-email'    // Tipo de plantilla
    );

    return {
      message:
        'User registered successfully. Please check your email for confirmation.',
    };
  }

  // CONFIRM ACCOUNT
  async confirmAccount(token: string) {
    const tokenUsed = await this.tokenService.isTokenUsed(token);
    if (tokenUsed) {
      throw new BadRequestException('Token has already been used.');
    }

    const { email } = this.jwtService.verify(token);
    const user = await this.usersService.getUserByIdentifier(email);

    if (!user) {
      throw new BadRequestException('Invalid token');
    }

    await this.tokenService.markTokenAsUsed(token);

    await this.usersService.markUserAsConfirmed(user.id);
    return { message: 'Account confirmed successfully.' };
  }

  // FORGOT PASSWORD
  async forgotPassword(email: string) {
    const user = await this.usersService.getUserByIdentifier(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const resetToken = this.jwtService.sign({ email: user.email });
    await this.tokenService.createToken(user.email, resetToken);

    const resetUrl = `${this.configService.get('CLIENT_URL')}/auth/update-password?token=${resetToken}&id=${user.id}`;
    
    // Cambios aquí: Pasamos el tipo de plantilla y el URL a `mail.service.ts`
    await this.mailService.sendMail(
      user.email,
      'Reset Password',
      resetUrl,  // URL para el correo de recuperación de contraseña
      'reset-password'  // Tipo de plantilla
    );

    return { message: 'Password reset email sent. Please check your email.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenUsed = await this.tokenService.isTokenUsed(token);
    if (tokenUsed) {
      throw new BadRequestException('Token has already been used.');
    }

    const { email } = this.jwtService.verify(token);
    const user = await this.usersService.getUserByIdentifier(email);

    if (!user) {
      throw new BadRequestException('Invalid token');
    }

    await this.usersService.updatePassword(user.id, newPassword);

    await this.tokenService.markTokenAsUsed(token);

    return { message: 'Password updated successfully.' };
  }
}
