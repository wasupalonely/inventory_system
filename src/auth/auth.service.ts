// src/auth/auth.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { LoginAuthDto } from './dto/login.dto';
import { User } from 'src/user/entities/user.entity';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { Role } from 'src/shared/enums/roles.enum';
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
      throw new BadRequestException(
        'Credenciales inválidas para el inicio de sesión.',
      );
    }

    if (!userValidation.isConfirmed) {
      throw new BadRequestException('Cuenta no confirmada.');
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
      throw new BadRequestException('El usuario ya existe');
    }

    if (userDto.role !== Role.Owner) {
      throw new BadRequestException('Solo se puede registrar el rol dueño');
    }

    userDto.password = bcrypt.hashSync(userDto.password, 10);
    const user = await this.usersService.create(userDto);

    const confirmationToken = this.jwtService.sign(
      { email: user.email },
      {
        expiresIn: '60m',
      },
    );

    await this.tokenService.createToken(user.email, confirmationToken);

    const confirmationUrl = `${this.configService.get('CLIENT_URL')}/auth/confirm?token=${confirmationToken}`;

    await this.mailService.sendMail(
      user.email,
      'Confirma tu cuenta de MeatStock',
      `Hola ${user.firstName},\n\n¡Bienvenido a MeatStock! Gracias por unirte a nuestra plataforma de gestión de inventarios de carne y frescura. Para activar tu cuenta y empezar a usar MeatStock, por favor confirma tu cuenta haciendo clic en el siguiente enlace: ${confirmationUrl}\n\nSi no solicitaste esta acción, puedes ignorar este mensaje.`,
      `<div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Hola ${user.firstName},</h2>
          <p>¡Gracias por registrarte en MeatStock! Estamos encantados de que te unas a nuestra plataforma de seguimiento de inventario y frescura de carne. Para activar tu cuenta y comenzar a aprovechar todo lo que ofrecemos, confirma tu correo electrónico haciendo clic en el siguiente enlace:</p>
          <p><a href="${confirmationUrl}" style="color: #1a73e8; text-decoration: none;">Confirmar cuenta</a></p>
          <p>Si no solicitaste esta acción, simplemente ignora este mensaje.</p>
          <br>
          <p>Saludos,</p>
          <p>El equipo de soporte de MeatStock</p>
       </div>`,
    );

    return {
      message:
        'Usuario registrado exitosamente. Por favor, revisa tu correo electrónico para la confirmación.',
    };
  }

  // CONFIRM ACCOUNT
  async confirmAccount(token: string) {
    const tokenUsed = await this.tokenService.isTokenUsed(token);
    if (tokenUsed) {
      throw new BadRequestException('El token ya ha sido utilizado.');
    }

    const { email } = this.jwtService.verify(token);
    const user = await this.usersService.getUserByIdentifier(email);

    if (!user) {
      throw new BadRequestException('Token inválido');
    }

    await this.tokenService.markTokenAsUsed(token);

    await this.usersService.markUserAsConfirmed(user.id);
    return { message: 'Cuenta confirmada exitosamente.' };
  }

  // FORGOT PASSWORD
  async forgotPassword(email: string) {
    const user = await this.usersService.getUserByIdentifier(email);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }

    const resetToken = this.jwtService.sign(
      { email: user.email },
      {
        expiresIn: '15m',
      },
    );
    await this.tokenService.createToken(user.email, resetToken);

    const resetUrl = `${this.configService.get('CLIENT_URL')}/auth/update-password?token=${resetToken}&id=${user.id}`;
    await this.mailService.sendMail(
      user.email,
      'Solicitud para restablecer contraseña en MeatStock',
      `Hola ${user.firstName},\n\nRecibimos una solicitud para restablecer la contraseña de tu cuenta en MeatStock. Si fuiste tú quien la solicitó, por favor, restablece tu contraseña haciendo clic en el siguiente enlace: ${resetUrl}\n\nSi no solicitaste el restablecimiento de la contraseña, por favor ignora este correo o contáctanos si tienes alguna duda.\n\nEste enlace expirará en 30 minutos por razones de seguridad.\n\nSaludos,\nEl equipo de soporte de MeatStock.`,
      `<div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Hola ${user.firstName},</h2>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en MeatStock. Si fuiste tú quien solicitó el cambio, puedes restablecer tu contraseña haciendo clic en el siguiente enlace:</p>
          <p><a href="${resetUrl}" style="color: #1a73e8; text-decoration: none;">Restablecer contraseña</a></p>
          <p>Si no solicitaste el restablecimiento de la contraseña, puedes ignorar este correo o ponerte en contacto con nosotros si tienes alguna duda.</p>
          <p><strong>Importante:</strong> El enlace para restablecer tu contraseña expirará en 30 minutos por razones de seguridad.</p>
          <br>
          <p>Saludos,</p>
          <p>El equipo de soporte de MeatStock</p>
       </div>`,
    );

    return {
      message:
        'Correo electrónico de restablecimiento de contraseña enviado. Por favor, revisa tu correo electrónico',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenUsed = await this.tokenService.isTokenUsed(token);
    if (tokenUsed) {
      throw new BadRequestException('El token ya ha sido utilizado.');
    }

    const { email } = this.jwtService.verify(token);
    const user = await this.usersService.getUserByIdentifier(email);

    if (!user) {
      throw new BadRequestException('Token inválido');
    }

    await this.usersService.updatePassword(user.id, newPassword);

    await this.tokenService.markTokenAsUsed(token);

    return { message: 'Contraseña actualizada exitosamente.' };
  }
}
