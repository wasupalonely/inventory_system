import { Controller, Post, Body, UseGuards, Param, Res } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/sale.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { Role } from 'src/shared/enums/roles.enum';
import { Response } from 'express';

@ApiTags('Sales')
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Roles(Role.Admin, Role.Cashier)
  @Post()
  @ApiResponse({ status: 201, description: 'Sale created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createSale(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.createSale(createSaleDto);
  }

  @Roles(Role.Admin, Role.Cashier)
  @Post(':saleId/invoice')
  @ApiResponse({ status: 201, description: 'Invoice generated successfully' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async generateInvoice(
    @Param('saleId') saleId: number,
    @Res() response: Response,
  ) {
    return this.salesService.generateInvoicePDF(saleId, response);
  }
}
