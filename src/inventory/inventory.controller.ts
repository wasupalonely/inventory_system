import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { Role } from 'src/shared/enums/roles.enum';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { CreateInventoryDto } from './dto/inventory.dto';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles(Role.Admin, Role.Cashier)
  @Post('add-stock')
  @ApiResponse({ status: 201, description: 'Existencias añadidas correctamente' })
  @ApiResponse({ status: 400, description: 'Mala petición' })
  async addStock(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.addStock(createInventoryDto);
  }
}
