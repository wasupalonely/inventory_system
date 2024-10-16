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
      throw new BadRequestException('Credenciales de inicio de sesión no válidas');
    }

    if (!userValidation.isConfirmed) {
      throw new BadRequestException('Cuenta sin confirmar');
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

    const confirmationToken = this.jwtService.sign({ email: user.email });

    await this.tokenService.createToken(user.email, confirmationToken);

    const confirmationUrl = `${this.configService.get('CLIENT_URL')}/auth/confirm?token=${confirmationToken}`;

    // Cambios aquí: Pasamos el tipo de plantilla y el URL a `mail.service.ts`
    await this.mailService.sendMail(
      user.email,
      'Confirmar su cuenta',
      confirmationUrl,  // URL para el correo de confirmación
      'confirm-email'    // Tipo de plantilla
    );

    return {
      message:
        'El usuario se ha registrado correctamente. Compruebe su correo electrónico para obtener confirmación.',
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
      throw new BadRequestException('token invalido');
    }

    await this.tokenService.markTokenAsUsed(token);

    await this.usersService.markUserAsConfirmed(user.id);
    return { message: 'Cuenta confirmada con éxito.' };
  }

  // FORGOT PASSWORD
  async forgotPassword(email: string) {
    const user = await this.usersService.getUserByIdentifier(email);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const resetToken = this.jwtService.sign({ email: user.email });
    await this.tokenService.createToken(user.email, resetToken);

    const resetUrl = `${this.configService.get('CLIENT_URL')}/auth/update-password?token=${resetToken}&id=${user.id}`;
    
    // Cambios aquí: Pasamos el tipo de plantilla y el URL a `mail.service.ts`
    await this.mailService.sendMail(
      user.email,
      'Restablecer contraseña',
      resetUrl,  // URL para el correo de recuperación de contraseña
      'reset-password'  // Tipo de plantilla
    );

    return { message: 'Se ha enviado un correo electrónico para restablecer la contraseña. Por favor, compruebe su correo electrónico.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenUsed = await this.tokenService.isTokenUsed(token);
    if (tokenUsed) {
      throw new BadRequestException('El token ya ha sido utilizado.');
    }

    const { email } = this.jwtService.verify(token);
    const user = await this.usersService.getUserByIdentifier(email);

    if (!user) {
      throw new BadRequestException('token invalido');
    }

    await this.usersService.updatePassword(user.id, newPassword);

    await this.tokenService.markTokenAsUsed(token);

    return { message: 'Contraseña actualizada correctamente.' };
  }
}
