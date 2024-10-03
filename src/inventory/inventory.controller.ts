import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/inventory.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { Role } from 'src/shared/enums/roles.enum';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles(Role.Admin, Role.Cashier)
  @Post('add-stock')
  @ApiResponse({ status: 201, description: 'Stock added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async addStock(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.addStock(createInventoryDto);
  }
}
