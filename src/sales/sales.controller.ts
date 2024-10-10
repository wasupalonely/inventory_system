import { Body, Controller, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { Role } from 'src/shared/enums/roles.enum';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { CreateSaleDto } from './dto/sale.dto';
import { SalesService } from './sales.service';

@ApiTags('Sales')
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Roles(Role.Admin, Role.Cashier)
  @Post()
  @ApiResponse({ status: 201, description: 'Venta creada con éxito' })
  @ApiResponse({ status: 400, description: 'Mala petición' })
  async createSale(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.createSale(createSaleDto);
  }

  @Roles(Role.Admin, Role.Cashier)
  @Post(':saleId/invoice')
  @ApiResponse({ status: 201, description: 'Factura generada correctamente' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async generateInvoice(
    @Param('saleId') saleId: number,
    @Res() response: Response,
  ) {
    return this.salesService.generateInvoicePDF(saleId, response);
  }
}
