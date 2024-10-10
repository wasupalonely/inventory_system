// src/auth/auth.controller.ts
import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/user.dto';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiResponse({ status: 200, description: 'Inicio de sesión correcto' })
  @ApiResponse({ status: 400, description: 'Credenciales no válidas' })
  async login(@Body() req: LoginAuthDto) {
    return this.authService.login(req);
  }

  @Post('register')
  @ApiResponse({ status: 201, description: 'Registrarse con éxito' })
  @ApiResponse({ status: 400, description: 'El usuario ya existe' })
  @ApiResponse({ status: 400, description: 'Mala petición' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('confirm')
  @ApiResponse({ status: 200, description: 'Cuenta confirmada correctamente' })
  @ApiResponse({ status: 400, description: 'Token no válido' })
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
  @ApiResponse({ status: 200, description: 'Contraseña actualizada correctamente' })
  @ApiResponse({ status: 400, description: 'Token no válido' })
  async resetPassword(
    @Query('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }
}
