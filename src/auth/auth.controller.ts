import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/user.dto';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('inicio de sesión')
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiResponse({ status: 400, description: 'Credenciales inválidas' })
  async login(@Body() req: LoginAuthDto) {
    return this.authService.login(req);
  }

  @Post('registro')
  @ApiResponse({ status: 201, description: 'Registro efectuado con éxito' })
  @ApiResponse({ status: 400, description: 'El usuario ya existe' })
  @ApiResponse({ status: 400, description: 'Petición incorrecta' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('confirmar')
  @ApiResponse({ status: 200, description: 'Cuenta confirmada correctamente' })
  @ApiResponse({ status: 400, description: 'Token inválido' })
  async confirmAccount(@Query('token') token: string) {
    return this.authService.confirmAccount(token);
  }

  @Post('contraseña-olvidada')
  @ApiResponse({ status: 200, description: 'Correo electrónico de restablecimiento de contraseña enviado' })
  @ApiResponse({ status: 400, description: 'Usuario no encontrado' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('restablecer-contraseña')
  @ApiResponse({ status: 200, description: 'Contraseña actualizada correctamente' })
  @ApiResponse({ status: 400, description: 'Token inválido' })
  async resetPassword(
    @Query('token') token: string,
    @Body('contraseña') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }
}
