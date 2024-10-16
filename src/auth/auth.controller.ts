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
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  async login(@Body() req: LoginAuthDto) {
    return this.authService.login(req);
  }

  @Post('register')
  @ApiResponse({ status: 201, description: 'Register successful' })
  @ApiResponse({ status: 400, description: 'User already exists' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('confirm')
  @ApiResponse({ status: 200, description: 'Account confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async confirmAccount(@Query('token') token: string) {
    return this.authService.confirmAccount(token);
  }

  @Post('forgot-password')
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 400, description: 'User not found' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async resetPassword(
    @Query('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }
}
