import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { Role } from 'src/shared/enums/roles.enum';
import { Inventory } from './entities/inventory.entity';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles(Role.Admin, Role.Cashier, Role.Owner)
  @Post('add-stock')
  @ApiResponse({ status: 201, description: 'Stock added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async addStock(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.addStock(createInventoryDto);
  }

  @Roles(Role.Admin, Role.Cashier, Role.Owner)
  @Put('edit-stock/:productId/:supermarketId')
  @ApiResponse({ status: 201, description: 'Stock edited successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async editStock(
    @Body() updateInventoryDto: UpdateInventoryDto,
    @Param('productId') productId: number,
    @Param('supermarketId') supermarketId: number,
  ) {
    return this.inventoryService.editStock(
      updateInventoryDto,
      productId,
      supermarketId,
    );
  }

  // ENDPOINT PARA OBTENER EL INVENTARIO COMPLETO DE UN SUPERMERCADO
  @Get('supermarket/:id')
  @ApiResponse({
    status: 200,
    description: 'Inventory retrieved successfully',
    type: [Inventory],
  })
  @ApiResponse({ status: 404, description: 'Supermercado no encontrado' })
  async getInventoryBySupermarket(id: number): Promise<Inventory[]> {
    return this.inventoryService.getInventoryBySupermarket(id);
  }

  @Delete('delete-inventory/:productId/:supermarketId')
  @Roles(Role.Admin, Role.Cashier, Role.Owner)
  @ApiResponse({ status: 200, description: 'Inventory deleted successfully' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  async deleteInventory(productId: number, supermarketId: number) {
    return this.inventoryService.deleteInventory(productId, supermarketId);
  }
}
