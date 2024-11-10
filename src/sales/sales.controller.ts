import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Res,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
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

  @Roles(Role.Admin, Role.Cashier, Role.Owner)
  @Post()
  @ApiResponse({ status: 201, description: 'Sale created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createSale(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.createSale(createSaleDto);
  }

  @Roles(Role.Admin, Role.Cashier, Role.Owner)
  @Post(':saleId/invoice')
  @ApiResponse({ status: 201, description: 'Invoice generated successfully' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async generateInvoice(
    @Param('saleId') saleId: number,
    @Res() response: Response,
  ) {
    return this.salesService.generateInvoicePDF(saleId, response);
  }

  @Roles(Role.Admin, Role.Cashier, Role.Owner, Role.Viewer)
  @Get(':supermarketId')
  @ApiResponse({ status: 200, description: 'Sales retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Supermarket not found' })
  async getAllSales(@Param('supermarketId') supermarketId: number) {
    return this.salesService.getSalesBySupermarket(supermarketId);
  }

  @Get('chart-data/:supermarketId')
  async getMonthlySalesDataBySupermarket(
    @Param('supermarketId', ParseIntPipe) supermarketId: number,
  ) {
    const salesData = await this.salesService.getMonthlySalesDataBySupermarket(supermarketId);
    return {
      thisYear: salesData.thisYear,
      lastYear: salesData.lastYear,
    };
  }

  @Get('total-earnings/:supermarketId')
  async getTotalEarningsBySupermarket(@Param('supermarketId', ParseIntPipe) supermarketId: number) {
    return this.salesService.getTotalEarningsBySupermarket(supermarketId);
  }
}
