// src/auth/auth.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { LoginAuthDto } from './dto/login.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
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
      throw new BadRequestException('Invalid credentials');
    }

    const payload = {
      email: userValidation.email,
      sub: userValidation.id,
      role: userValidation.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userDto: CreateUserDto) {
    if (await this.usersService.getUserByIdentifier(userDto.email)) {
      throw new BadRequestException('User already exists');
    }

    userDto.password = bcrypt.hashSync(userDto.password, 10);
    const user = await this.usersService.create(userDto);
    return this.login(user);
  }
}
