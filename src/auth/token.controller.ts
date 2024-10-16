// src/auth/auth.controller.ts
import { Controller, Param, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokenService } from './token.service';

@ApiTags('Token')
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('validate-token/:token')
  async valdateToken(@Param('token') token: string): Promise<boolean> {
    return this.tokenService.isTokenUsed(token);
  }
}
