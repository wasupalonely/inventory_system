import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { SupermarketService } from './supermarket.service';

@ApiTags('Supermarket')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('supermarket')
export class SupermarketController {
  constructor(private readonly supermarketService: SupermarketService) {}
}
