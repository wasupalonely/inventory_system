// src/auth/auth.controller.ts
import { Controller, Post, Body, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login.dto';
import { CreateUserDto } from 'src/user/dto/user.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiResponse({ status: 400, description: 'Credenciales inválidas' })
  async login(@Body() req: LoginAuthDto) {
    return this.authService.login(req);
  }

  @Post('register')
  @ApiResponse({ status: 201, description: 'Registro exitoso' })
  @ApiResponse({ status: 400, description: 'El usuario ya existe' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('confirm')
  @ApiResponse({ status: 200, description: 'Cuenta confirmada exitosamente' })
  @ApiResponse({ status: 400, description: 'Token inválido' })
  async confirmAccount(@Query('token') token: string) {
    return this.authService.confirmAccount(token);
  }

  @Post('forgot-password')
  @ApiResponse({ status: 200, description: 'Correo electrónico de restablecimiento de contraseña enviado' })
  @ApiResponse({ status: 400, description: 'Usuario no encontrado' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiResponse({ status: 200, description: 'Contraseña actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Token inválido' })
  async resetPassword(
    @Query('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }
}
